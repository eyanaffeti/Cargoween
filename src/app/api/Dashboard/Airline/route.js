// src/app/api/Dashboard/Airline/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";

import Reservation from "@/models/Reservation";
import Offre from "@/models/Offre";
import Airline from "@/models/Airline";
import Transitaire from "@/models/Transitaire";

const { Types } = mongoose;
const OID = (id) => (Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null);

const MONTHS        = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
const ETAT_KEYS     = ["En attente", "Acceptée", "Annulée"];
const PAY_KEYS      = ["Non payé", "Payée", "Échouée"];

const ensureBuckets = (agg, keys, k = "_id") =>
  keys.map(key => agg.find(x => String(x[k]) === String(key)) || { [k]: key, count: 0 });

const monthSeriesFromAgg = (agg) =>
  MONTHS.map((m, i) => {
    const hit = agg.find(x => x._id === i + 1);
    return {
      month: m,
      count: hit?.count || 0,
      totalWeight: hit?.totalWeight || 0,
      totalPrice: hit?.totalPrice || 0,
    };
  });

// fallback très simple: nom → code
const NAME2CODE = {
  "Express Air Cargo": "A7",
};

export async function GET(req) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const userId      = searchParams.get("userId");
  let   airlineCode = (searchParams.get("airlineCode") || "").trim();
  const role        = (searchParams.get("role") || "").toLowerCase();

  try {
    // 1) On identifie l'Airline et son code si manquant
    let airlineDoc = null;
    if (!airlineCode && userId) {
      airlineDoc = await Airline.findById(userId).lean();
      if (airlineDoc) {
        airlineCode = airlineDoc.airlineCode || airlineDoc.iataCode || NAME2CODE[airlineDoc.company] || "";
      }
    }
    if (!airlineDoc && userId) {
      airlineDoc = await Airline.findById(userId).lean().catch(()=>null);
    }

    if (!airlineCode && airlineDoc?.company) {
      airlineCode = NAME2CODE[airlineDoc.company] || "";
    }
    if (!airlineCode) {
      return NextResponse.json({ message: "airlineCode manquant" }, { status: 400 });
    }

    const airlineId = airlineDoc?._id ? OID(String(airlineDoc._id)) : null;

    // 2) Domaine de données
    // Offres de cette compagnie
    const offerMatch = airlineId
      ? { $or: [ { airline: airlineId }, { airlineName: airlineDoc.company }, { iataCode: airlineCode } ] }
      : { $or: [ { airlineName: airlineDoc?.company || "__" }, { iataCode: airlineCode } ] };

    // Réservations sur SES offres (dans ton modèle Reservation, "airline" est une string)
    // On accepte code ou nom pour robustesse
    const resMatch = {
      $or: [
        { airline: airlineCode },
        airlineDoc?.company ? { airline: airlineDoc.company } : null,
        airlineDoc?.iataCode ? { airline: airlineDoc.iataCode } : null,
        airlineDoc?.airlineCode ? { airline: airlineDoc.airlineCode } : null,
      ].filter(Boolean)
    };

    // 3) Agrégations en parallèle
    const [
      offersCount,
      resCount,
      byEtatAgg,
      byPayAgg,
      byMonthAgg,
      topRoutesAgg,
      topForwardersAgg,
      latestResDocs,
    ] = await Promise.all([
      Offre.countDocuments(offerMatch),

      Reservation.countDocuments(resMatch),

      Reservation.aggregate([
        { $match: resMatch },
        { $group: { _id: "$etat", count: { $sum: 1 } } },
      ]),

      Reservation.aggregate([
        { $match: resMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Reservation.aggregate([
        { $match: resMatch },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
            totalWeight: { $sum: { $ifNull: ["$totalWeight", 0] } },
            totalPrice:  { $sum: { $ifNull: ["$totalPrice", 0] } },
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Top routes à partir des OFFRES publiées
      Offre.aggregate([
        { $match: offerMatch },
        { $group: { _id: { from: "$from", to: "$to" }, count: { $sum: 1 } } },
        { $project: { _id: 0, route: { $concat: ["$_id.from"," → ","$_id.to"] }, count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Top transitaires qui réservent sur cette compagnie
      Reservation.aggregate([
        { $match: resMatch },
        { $group: { _id: "$user", count: { $sum: 1 } } },
        { $lookup: { from: "transitaires", localField: "_id", foreignField: "_id", as: "t" } },
        { $unwind: "$t" },
        { $project: { _id: 0, name: { $ifNull: ["$t.company", { $concat: ["$t.firstname"," ","$t.lastname"] }]}, count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Dernières réservations
      Reservation.find(resMatch, "createdAt totalPrice airline user awb flightNumber status etat")
        .populate("user", "company firstname lastname")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

    const reservationsByEtat   = ensureBuckets(byEtatAgg, ETAT_KEYS);
    const reservationsByStatus = ensureBuckets(byPayAgg,  PAY_KEYS);
    const reservationsByMonth  = monthSeriesFromAgg(byMonthAgg);

    // Totaux utiles côté compagnie
    const totalWeight = reservationsByMonth.reduce((s, m) => s + (m.totalWeight || 0), 0);
    const paidCount   = reservationsByStatus.find(s => s._id === "Payée")?.count || 0;
    const paidTotal   = paidCount
      ? await Reservation.aggregate([
          { $match: { ...resMatch, status: "Payée" } },
          { $group: { _id: null, t: { $sum: { $ifNull: ["$totalPrice", 0] } } } }
        ]).then(a => a?.[0]?.t || 0).catch(()=>0)
      : 0;

  // helper pour convertir "18 TND", "12,5", 12 -> 18 / 12.5 / 12
const num = (v) => {
  if (v === null || v === undefined) return 0;
  const s = String(v).replace(',', '.').replace(/[^\d.-]/g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

// ... après tes agrégats latestResDocs etc.

const invoices = (latestResDocs || []).map((r) => {
  const tarif  = num(r.tarif);                       // prix / kg (ou à l’unité)
  // essaie totalWeight, sinon weight, sinon 0
  const weight = num(r.totalWeight ?? r.weight);
  const tprice = num(r.totalPrice);                  // peut être "18 TND" ou vide

  // montant réservé fiable
  const amountBooked = tprice > 0 ? tprice : (tarif * weight);
  // montant payé = réservé seulement si status = Payée
  const amountPaid   = (r.status === "Payée") ? amountBooked : 0;

  return {
    number: `RES-${r._id.toString().slice(-6).toUpperCase()}`,
    date: r.createdAt,
    dueDate: new Date(new Date(r.createdAt).getTime() + 14 * 24 * 3600 * 1000),
    reservedBy: r.user?.company || `${r.user?.firstname || ""} ${r.user?.lastname || ""}`.trim() || "-",
    lta: r.awb || r.flightNumber || "-",
    status: r.status || "Non payé",
    etat: r.etat || "En attente",

    // 👇 clés utilisées par le front
    amountBooked,
    amountPaid,

    // utiles en debug
    tarif,
    totalWeight: weight,
    totalPrice: tprice,
  };
});

// Totaux fiables (basés sur la même logique que ci-dessus)
const caTotal   = invoices.reduce((s, r) => s + (r.amountBooked || 0), 0);
const caPayee   = invoices.reduce((s, r) => s + (r.amountPaid   || 0), 0);


    // Funnel simple: Offres publiées → Réservations → Acceptées → Payées
    const acceptedCount = reservationsByEtat.find(e => e._id === "Acceptée")?.count || 0;
    const funnel = [
      { stage: "Offres publiées",          value: offersCount },
      { stage: "Réservations reçues",      value: resCount },
      { stage: "Réservations acceptées",   value: acceptedCount },
      { stage: "Réservations payées",      value: paidCount },
    ];

    return NextResponse.json({
      meta: { airlineCode },
      totals: {
          offers: offersCount,
  reservations: resCount,
  totalWeight,
  caTotal,               // ← issu du reduce ci-dessus
  caPayee: caPayee,      // ← idem
  tauxAcceptation: resCount ? Math.round((acceptedCount / resCount) * 100) : 0,
        tauxAcceptation: resCount ? Math.round((acceptedCount / resCount) * 100) : 0,
      },
      charts: {
        reservationsByEtat,
        reservationsByStatus,
        reservationsByMonth,
        topRoutes: topRoutesAgg,       // [{route, count}]
        topForwarders: topForwardersAgg, // [{name, count}]
        invoices,
        funnel,
      }
    }, { status: 200 });

  } catch (err) {
    console.error("/api/Dashboard/Airline ->", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
