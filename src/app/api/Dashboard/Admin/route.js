import { connectToDatabase } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Airline from "@/models/Airline";
import Transitaire from "@/models/Transitaire";
import Offre from "@/models/Offre";
import AWBStock from "@/models/Stockawb";

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
const ensureBuckets = (agg, keys, labelKey="_id") =>
  keys.map(k => agg.find(x => x[labelKey] === k) || { [labelKey]: k, count: 0 });

export async function GET() {
  await connectToDatabase();

  try {
    // Compteurs
    const [totalReservations, totalAirlines, totalTransitaires, totalOffres, totalAwb] =
      await Promise.all([
        Reservation.countDocuments(),
        Airline.countDocuments(),
        Transitaire.countDocuments(),
        Offre.countDocuments(),
        AWBStock.countDocuments(),
      ]);

    // Réservations par ÉTAT (labels propres + buckets vides)
    const etatAgg = await Reservation.aggregate([
      { $group: { _id: "$etat", count: { $sum: 1 } } }
    ]);
    const etatKeys = ["En attente", "Acceptée", "Annulée"];
    const reservationsByEtat = ensureBuckets(etatAgg, etatKeys);

    // Réservations par STATUT PAIEMENT (labels propres + buckets vides)
    const statusAgg = await Reservation.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const statusKeys = ["Non payé", "Payée", "Échouée"];
    const reservationsByStatus = ensureBuckets(statusAgg, statusKeys);

    // Réservations par mois (mois libellés + valeurs 0 si manquants)
    const byMonthAgg = await Reservation.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
          totalWeight: { $sum: "$totalWeight" },
          totalPrice: { $sum: "$totalPrice" },
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    const byMonth = MONTHS.map((m, i) => {
      const hit = byMonthAgg.find(x => x._id === i + 1);
      return {
        month: m,
        count: hit?.count || 0,
        totalWeight: hit?.totalWeight || 0,
        totalPrice: hit?.totalPrice || 0,
      };
    });

    // Top compagnies (résolution NOM : company/iataCode/airlineCode -> fallback Reservation.airline)
    const topAirlines = await Reservation.aggregate([
      {
        $lookup: {
          from: "airlines",
          let: { key: "$airline" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$company", "$$key"] },
                    { $eq: ["$iataCode", "$$key"] },
                    { $eq: ["$airlineCode", "$$key"] },
                  ]
                }
              }
            }
          ],
          as: "doc"
        }
      },
      {
        $addFields: {
          airlineName: {
            $ifNull: [{ $arrayElemAt: ["$doc.company", 0] }, "$airline"]
          }
        }
      },
      { $group: { _id: "$airlineName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Offres par compagnie
    const offresByCompany = await Offre.aggregate([
      { $group: { _id: "$airlineName", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // AWB utilisés vs libres -> labels propres
    const awbByStatusRaw = await AWBStock.aggregate([
      { $group: { _id: "$used", count: { $sum: 1 } } }
    ]);
    const awbByStatus = [
      { _id: "Disponibles", count: awbByStatusRaw.find(x => x._id === false)?.count || 0 },
      { _id: "Utilisés",    count: awbByStatusRaw.find(x => x._id === true)?.count  || 0 },
    ];

    // AWB par type (buckets vides)
    const awbTypeKeys = ["Paper AWB", "EAP", "EAW"];
    const awbByTypeAgg = await AWBStock.aggregate([
      { $group: { _id: "$awbType", count: { $sum: 1 } } }
    ]);
    const awbByType = ensureBuckets(awbByTypeAgg, awbTypeKeys);
// === Nouveaux transitaires / mois ===
const transitairesByMonth = await Transitaire.aggregate([
  { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
  { $sort: { "_id": 1 } }
]);

// === Nouvelles compagnies / mois ===
const airlinesByMonth = await Airline.aggregate([
  { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
  { $sort: { "_id": 1 } }
]);

// === Réservations par transitaire (TOP 12) ===
const reservationsPerForwarder = await Reservation.aggregate([
  { $group: { _id: "$user", count: { $sum: 1 } } },
  { $lookup: { from: "transitaires", localField: "_id", foreignField: "_id", as: "t" } },
  { $unwind: "$t" },
  { $project: { _id: 0, name: "$t.company", count: 1 } },
  { $sort: { count: -1 } },
  { $limit: 12 }
]);

// === Chiffre d'affaires par compagnie (TOP 12) ===
const revenueByAirline = await Reservation.aggregate([
  { $group: { _id: "$airline", total: { $sum: "$totalPrice" } } },
  { $project: { _id: 0, name: "$_id", total: 1 } },
  { $sort: { total: -1 } },
  { $limit: 12 }
]);

// === "Facturation" (basé sur les réservations) ===
const invDocs = await Reservation.find(
  {},
  "createdAt totalPrice airline user awb flightNumber status"
)
  .populate("user", "company firstname lastname")
  .sort({ createdAt: -1 })
  .limit(20)
  .lean();

const invoices = invDocs.map((r) => ({
  number: `INV-${r._id.toString().slice(-6).toUpperCase()}`,
  date: r.createdAt,
  dueDate: new Date(new Date(r.createdAt).getTime() + 14 * 24 * 3600 * 1000),
  amount: r.totalPrice || 0,
  airline: r.airline || "-",
  reservedBy: `${r.user?.firstname || ""} ${r.user?.lastname || ""}`.trim(),
  lta: r.awb || r.flightNumber || "-",
  status: r.status || "Non payé",
}));
    return new Response(JSON.stringify({
      totals: {
        reservations: totalReservations,
        airlines: totalAirlines,
        transitaires: totalTransitaires,
        offres: totalOffres,
        awb: totalAwb,
      },
      charts: {
        reservationsByEtat,
        reservationsByStatus,
        reservationsByMonth: byMonth,  // {month,count,totalWeight,totalPrice}
        topAirlines,                    // {_id: "Tunisair", count: n}
        offresByCompany,                // idem
        awbByStatus,                    // {_id: "Disponibles"/"Utilisés"}
        awbByType,                      // {_id: "Paper AWB"/"EAP"/"EAW"}
         transitairesByMonth,
  airlinesByMonth,
  reservationsPerForwarder,
  revenueByAirline,
  invoices
      }
    }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
