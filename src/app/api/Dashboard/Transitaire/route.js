// src/app/api/Dashboard/Transitaire/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Airline from "@/models/Airline";
import Transitaire from "@/models/Transitaire";
import Offre from "@/models/Offre";
import AWBStock from "@/models/Stockawb";     // <- chemin/nom EXACT selon votre projet
import Marchandise from "@/models/Marchandise";

const { Types } = mongoose;
const OID = (id) => (Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null);

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
const ETAT_KEYS   = ["En attente", "Acceptée", "Annulée"];
const STATUS_KEYS = ["Non payé", "Payée", "Échouée"];
const AWB_TYPES   = ["Paper AWB", "EAP", "EAW"];
const MARCH_TYPES = ["Standard", "Température contrôlée", "Cargo Aircraft"];

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

export async function GET(req) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const role   = (searchParams.get("role") || "").toLowerCase();

  if (!userId || !role) {
    return NextResponse.json({ message: "userId ou role manquant" }, { status: 400 });
  }

  try {
    const isMainForwarder = role.includes("transitaire") && !role.includes("second");

    // ---- Sous-transitaires (⚠️ ajoutePar est une String dans votre modèle)
    const subs = isMainForwarder
      ? await Transitaire.find({ ajoutePar: String(userId) }, { _id: 1, company: 1, firstname: 1, lastname: 1, email: 1 }).lean()
      : [];

    // Périmètre utilisateurs = moi + sous-comptes
    const userIdsStr = [String(userId), ...subs.map(s => String(s._id))];
    const userIdsOID = userIdsStr.map(s => OID(s)).filter(Boolean);

    // Filtres
    const reservationMatch = { user: { $in: userIdsOID } };

    // ====== AGRÉGATIONS ======
    const [
      totalReservations,
      byEtatAgg,
      byStatusAgg,
      byMonthAgg,
      topAirlinesAgg,
      // Marchandises par type via lookup depuis Reservation
      marchTypeAgg,
      // Factures (réservations récentes)
      invoicesDocs,
      // CA par compagnie
      revenueByAirline,
    ] = await Promise.all([
      Reservation.countDocuments(reservationMatch),

      Reservation.aggregate([
        { $match: reservationMatch },
        { $group: { _id: "$etat", count: { $sum: 1 } } },
      ]),

      Reservation.aggregate([
        { $match: reservationMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Reservation.aggregate([
        { $match: reservationMatch },
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

      // Top compagnies par nombre de réservations (résolution du nom depuis Airline)
      Reservation.aggregate([
        { $match: reservationMatch },
        {
          $lookup: {
            from: "airlines",
            let: { key: "$airline" },
            pipeline: [
              { $match: {
                $expr: {
                  $or: [
                    { $eq: ["$company", "$$key"] },
                    { $eq: ["$iataCode", "$$key"] },
                    { $eq: ["$airlineCode", "$$key"] },
                  ]
                }
              } }
            ],
            as: "doc"
          }
        },
        { $addFields: { airlineName: { $ifNull: [ { $arrayElemAt: ["$doc.company", 0] }, "$airline" ] } } },
        { $group: { _id: "$airlineName", count: { $sum: 1 } } },
        { $project: { _id: 0, name: "$_id", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),

      // Marchandises par type (via réservations -> lookup)
      Reservation.aggregate([
        { $match: reservationMatch },
        {
          $lookup: {
            from: "marchandises",
            localField: "marchandise",
            foreignField: "_id",
            as: "m"
          }
        },
        { $unwind: "$m" },
        { $group: { _id: { $ifNull: ["$m.shipmentMode", "Standard"] }, count: { $sum: 1 } } },
      ]).catch(() => []),

      // Facturation
      Reservation.find(reservationMatch, "createdAt totalPrice airline user awb flightNumber status")
        .populate("user", "company firstname lastname")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),

      // CA par compagnie
      Reservation.aggregate([
        { $match: reservationMatch },
        { $group: { _id: "$airline", total: { $sum: { $ifNull: ["$totalPrice", 0] } } } },
        { $project: { _id: 0, name: "$_id", total: 1 } },
        { $sort: { total: -1 } },
        { $limit: 12 }
      ]),
    ]);

    const reservationsByEtat   = ensureBuckets(byEtatAgg, ETAT_KEYS);
    const reservationsByStatus = ensureBuckets(byStatusAgg, STATUS_KEYS);
    const reservationsByMonth  = monthSeriesFromAgg(byMonthAgg);
    const marchandiseByType    = ensureBuckets(marchTypeAgg, MARCH_TYPES);

  // ===== AWB (statut & type) =====
let awbByStatus = [];
let awbByType   = [];

if (isMainForwarder) {
  // Savoir si le champ addedBy est utilisé dans ta base
  const hasAddedBy = !!(await AWBStock.exists({ addedBy: { $exists: true, $ne: null } }).lean().catch(()=>null));
  const ownerMatch = hasAddedBy ? { addedBy: { $in: userIdsOID } } : {}; // fallback global

  // 1) Stock (dispo/typé) selon ownerMatch
  const [stockUsedCount, stockAvailCount, stockTypeAgg] = await Promise.all([
    AWBStock.countDocuments({ ...ownerMatch, used: true }).catch(() => 0),
    AWBStock.countDocuments({ ...ownerMatch, used: false }).catch(() => 0),
    AWBStock.aggregate([
      { $match: { ...ownerMatch } },
      { $group: { _id: "$awbType", count: { $sum: 1 } } },
    ]).catch(() => []),
  ]);

  // 2) Utilisés observés dans les réservations (si pas de stock)
  const awbFromRes = await Reservation.aggregate([
    { $match: { ...reservationMatch, awb: { $exists: true, $ne: null, $ne: "" } } },
    { $group: { _id: "$awb", count: { $sum: 1 }, type: { $first: "$awbType" } } },
  ]);
  const usedFromResCount = awbFromRes.reduce((s, d) => s + (d.count || 0), 0);

  const usedCount  = stockUsedCount || usedFromResCount;
  const availCount = stockAvailCount; // s'il n'y a pas de stock on ne peut pas deviner les "disponibles"

  awbByStatus = [
    { _id: "Disponibles", count: availCount || 0 },
    { _id: "Utilisés",    count: usedCount  || 0 },
  ];

  // Type = Stock + Réservations
  const typeFromRes = await Reservation.aggregate([
    { $match: { ...reservationMatch, awbType: { $in: AWB_TYPES } } },
    { $group: { _id: "$awbType", count: { $sum: 1 } } },
  ]);

  const typeMap = new Map();
  for (const d of stockTypeAgg) typeMap.set(d._id, (typeMap.get(d._id) || 0) + (d.count || 0));
  for (const d of typeFromRes)  typeMap.set(d._id, (typeMap.get(d._id) || 0) + (d.count || 0));
  awbByType = ["Paper AWB","EAP","EAW"].map(k => ({ _id: k, count: typeMap.get(k) || 0 }));
}


    // ===== Sous-comptes (liste + perf)
    let subAccountsPerf = [];
    if (isMainForwarder && subs.length) {
      const subIds = subs.map(s => OID(String(s._id))).filter(Boolean);
      subAccountsPerf = await Reservation.aggregate([
        { $match: { user: { $in: subIds } } },
        { $group: { _id: "$user", count: { $sum: 1 } } },
        { $lookup: { from: "transitaires", localField: "_id", foreignField: "_id", as: "t" } },
        { $unwind: "$t" },
        {
          $project: {
            _id: 0,
            name: { $ifNull: ["$t.company", { $concat: ["$t.firstname", " ", "$t.lastname", " (sec)"] }] },
            count: 1,
          }
        },
        { $sort: { count: -1 } }
      ]);
    }

    // Totaux
    const totalCA     = reservationsByMonth.reduce((s, m) => s + (m.totalPrice  || 0), 0);
    const totalWeight = reservationsByMonth.reduce((s, m) => s + (m.totalWeight || 0), 0);

    // Invoices
    const invoices = (invoicesDocs || []).map((r) => ({
      number: `INV-${r._id.toString().slice(-6).toUpperCase()}`,
      date: r.createdAt,
      dueDate: new Date(new Date(r.createdAt).getTime() + 14 * 24 * 3600 * 1000),
      amount: r.totalPrice || 0,
      airline: r.airline || "-",
      reservedBy: `${r.user?.firstname || ""} ${r.user?.lastname || ""}`.trim() || r.user?.company || "-",
      lta: r.awb || r.flightNumber || "-",
      status: r.status || "Non payé",
    }));

    // Entonnoir simple
    const statusMap     = Object.fromEntries(reservationsByStatus.map(s => [s._id, s.count]));
    const acceptedCount = reservationsByEtat.find(e => e._id === "Acceptée")?.count || 0;
    const paiementCount = (statusMap["Payée"] || 0) + (statusMap["Échouée"] || 0);
    const funnel = [
      { stage: "Recherche", value: 0 },
      { stage: "Sélection offre", value: totalReservations },
      { stage: "Détails marchandise", value: marchandiseByType.reduce((s,d)=>s+(d.count||0),0) },
      { stage: "Paiement", value: paiementCount },
      { stage: "Confirmée", value: acceptedCount },
    ];

    return NextResponse.json({
      totals: {
        reservations: totalReservations,
        marchandises: marchandiseByType.reduce((s,d)=>s+(d.count||0),0),
        ca: totalCA,
        totalWeight,
        awbDisponibles: isMainForwarder ? (awbByStatus.find(x => x._id === "Disponibles")?.count || 0) : 0,
        awbUtilises:    isMainForwarder ? (awbByStatus.find(x => x._id === "Utilisés")?.count    || 0) : 0,
        subaccounts:    isMainForwarder ? subs.length : 0,
      },
      charts: {
        reservationsByEtat,
        reservationsByStatus,
        reservationsByMonth,
        topAirlines: topAirlinesAgg,   // [{ name, count }]
        marchandiseByType,
        awbByStatus,
        awbByType,
        subAccountsPerf,
        revenueByAirline,
        invoices,
        funnel,
        subAccounts: subs.map(s => ({
          _id: s._id,
          label: s.company || `${s.firstname} ${s.lastname}` || s.email
        })),
      }
    }, { status: 200 });

  } catch (err) {
    console.error("/api/Dashboard/Transitaire ->", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
