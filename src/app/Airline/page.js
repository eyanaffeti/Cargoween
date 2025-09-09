// src/app/Airline/Dashboard/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar-airline";
import { FaUser } from "react-icons/fa";
import dynamic from "next/dynamic";

/* ==== Recharts dynamiques ==== */
const {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, ComposedChart, LabelList
} = {
  LineChart: dynamic(() => import("recharts").then(m => m.LineChart), { ssr: false }),
  Line: dynamic(() => import("recharts").then(m => m.Line), { ssr: false }),
  XAxis: dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false }),
  YAxis: dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false }),
  CartesianGrid: dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false }),
  Tooltip: dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false }),
  Legend: dynamic(() => import("recharts").then(m => m.Legend), { ssr: false }),
  ResponsiveContainer: dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false }),
  PieChart: dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false }),
  Pie: dynamic(() => import("recharts").then(m => m.Pie), { ssr: false }),
  Cell: dynamic(() => import("recharts").then(m => m.Cell), { ssr: false }),
  BarChart: dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false }),
  Bar: dynamic(() => import("recharts").then(m => m.Bar), { ssr: false }),
  AreaChart: dynamic(() => import("recharts").then(m => m.AreaChart), { ssr: false }),
  Area: dynamic(() => import("recharts").then(m => m.Area), { ssr: false }),
  ComposedChart: dynamic(() => import("recharts").then(m => m.ComposedChart), { ssr: false }),
  LabelList: dynamic(() => import("recharts").then(m => m.LabelList), { ssr: false }),
};

/* ==== Thème ==== */
const THEME = {
  blue:   "#3F6592",
  indigo: "#5E7FB2",
  purple: "#7A4DD8",
  cyan:   "#56CFE1",
  slate:  "#94A3B8",
};
const COLORS = [THEME.blue, THEME.purple, THEME.cyan, THEME.indigo, THEME.slate];

const COLOR_BY_LABEL = {
  "En attente": THEME.cyan,
  "Acceptée":   THEME.blue,
  "Annulée":    THEME.purple,
  "Non payé":   THEME.cyan,
  "Payée":      THEME.blue,
  "Échouée":    THEME.purple,
};

const ETAT_KEYS = ["En attente","Acceptée","Annulée"];
const PAY_KEYS  = ["Non payé","Payée","Échouée"];

const ensureKeys = (data, keys) => keys.map(k => data?.find(d => (d._id ?? d.name) === k) || ({ _id: k, count: 0 }));
const legendPayloadFromKeys = (keys) => keys.map(k => ({ value: k, type: "square", color: COLOR_BY_LABEL[k] || THEME.slate }));
const formatInt = (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));
const formatMoney = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND", maximumFractionDigits: 0 }).format(n || 0);

const NAME2CODE = { "Express Air Cargo": "A7" };

const NoData = () => <p className="text-gray-500">Pas encore de données</p>;

export default function AirlineDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");

  // --- fetch
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const rMe = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      const me  = await rMe.json();
      setUser(me);

      const code =
        me?.airlineCode || me?.iataCode || NAME2CODE[me?.company] || "";

      const url = `/api/Dashboard/Airline?userId=${me._id}&role=airline&airlineCode=${encodeURIComponent(code)}`;
      const r = await fetch(url);
      const d = await r.json();
      if (!r.ok) { setMessage(d?.message || "Erreur de chargement"); return; }
      setStats(d);
    })().catch(() => setMessage("Impossible de charger les statistiques."));
  }, []);

  if (!stats) {
    return (
      <div className="flex">
        <Sidebar onToggle={setSidebarOpen} />
        <main className={`transition-all duration-300 flex-1 min-h-screen p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`} style={{ backgroundColor: THEME.blue }}>
          <div className="bg-white rounded-3xl p-32 shadow-lg">Chargement…</div>
        </main>
      </div>
    );
  }

  const { totals, charts, meta } = stats;

  // dérivés
  const byEtat  = ensureKeys(charts.reservationsByEtat, ETAT_KEYS);
  const byPay   = ensureKeys(charts.reservationsByStatus, PAY_KEYS);
  const payData = byPay.map(d => ({ status: String(d._id), count: d.count || 0 }));
  const payTotal = payData.reduce((s,d)=>s+d.count,0);

  // KPI
  const tauxAccept = totals.tauxAcceptation || 0;

  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`} style={{ backgroundColor: THEME.blue }}>
        <div className="bg-white rounded-3xl p-10 md:p-16 shadow-lg relative">

          {/* user */}
          <div className="absolute top-8 right-8">
            <div className="relative">
              <button className="flex items-center bg-[#3F6592] text-white py-3 px-6 md:px-8 rounded-full shadow-md">
                <FaUser className="mr-2" />
                <span>{user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}</span>
              </button>
            </div>
          </div>
<br></br> <br></br>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#3F6592] mb-16 text-center">
            Tableau de bord Compagnie — <span className="text-[#5E7FB2]">{user?.company}</span> <span className="text-sm align-super">({meta?.airlineCode})</span>
          </h2>
          {message && <p className="text-center text-red-500 mb-6">{message}</p>}

          {/* KPI */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 md:gap-18 mb-11">
            
            <div className="text-white p-2 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#5E7FB2] to-[#7A4DD8]">
              <h3 className="opacity-90">CA confirmé (réservations payées)</h3>
              <p className="text-3xl font-bold">{formatInt(totals.caPayee)}</p>
                              <span className="text-base font-semibold opacity-90">TND</span>

            </div>

            <div className="text-white p-6 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#3F6592] to-[#7A4DD8]">
              <h3 className="opacity-90">Offres publiées</h3>
              <p className="text-3xl font-bold">{formatInt(totals.offers)}</p>
            </div>

            <div className="text-white p-6 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#7A4DD8] to-[#56CFE1]">
              <h3 className="opacity-90">Réservations reçues</h3>
              <p className="text-3xl font-bold">{formatInt(totals.reservations)}</p>
            </div>

            <div className="text-white p-6 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#56CFE1] to-[#3F6592]">
              <h3 className="opacity-90">Poids réservé</h3>
              <p className="text-3xl font-bold">{formatInt(totals.totalWeight)}<span className="text-lg ml-1">kg</span></p>
            </div>

            <div className="text-white p-2 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#5E7FB2] to-[#7A4DD8]">
              <h3 className="opacity-90">CA total (toutes réservations)</h3>
              <p className="text-3xl font-bold">{formatInt(totals.caTotal)}</p>
                              <span className="text-base font-semibold opacity-90">TND</span>

            </div>

            <div className="text-white p-6 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#56CFE1] to-[#3F6592]">
              <h3 className="opacity-90">Taux d’acceptation</h3>
              <p className="text-3xl font-bold">{tauxAccept}%</p>
            </div>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

            {/* Réservations par état — Pie (donut) */}
            <div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Réservations par état</h3>
              {byEtat.some(x=>x.count>0) ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={byEtat.map((d,i)=>({ name: d._id, value: d.count, fill: COLOR_BY_LABEL[d._id] || COLORS[i%COLORS.length] }))}
                         dataKey="value" nameKey="name" innerRadius={60} outerRadius={120} stroke="#fff" strokeWidth={2} label />
                    <Tooltip />
                    <Legend payload={legendPayloadFromKeys(ETAT_KEYS)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData/>}
            </div>

            {/* Paiements — Histogramme (violet) */}
            <div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Statuts de paiement</h3>
              {payTotal ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={payData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Réservations" fill={THEME.purple} radius={[6,6,0,0]}>
                      <LabelList dataKey="count" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData/>}
            </div>

            {/* Évolution mensuelle — Réservations (barres) + CA (ligne) */}
            <div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md xl:col-span-2">
              <h3 className="text-lg font-semibold text-[#3F6592] mb-4">
                Évolution mensuelle (réservations & CA)
              </h3>
              {charts.reservationsByMonth?.some(m=>m.count>0 || m.totalPrice>0) ? (
                <ResponsiveContainer width="100%" height={360}>
                  <ComposedChart data={charts.reservationsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(v, n) => n?.includes("CA") ? formatMoney(v) : v} />
                    <Legend />
                    <Bar  yAxisId="left"  dataKey="count"      name="Réservations" fill={THEME.blue} radius={[6,6,0,0]} />
                    <Line yAxisId="right" type="monotone" dataKey="totalPrice" name="CA (TND)" stroke={THEME.cyan} strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : <NoData/>}
            </div>

            {/* Top routes — Bar horizontale */}
            <div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Top routes (offres publiées)</h3>
              {charts.topRoutes?.length ? (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={charts.topRoutes} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="route" width={220} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Offres" fill={THEME.blue}>
                      <LabelList dataKey="count" position="right" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData/>}
            </div>

            {/* Top transitaires — Bar horizontale */}
            <div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Top transitaires (réservations)</h3>
              {charts.topForwarders?.length ? (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={charts.topForwarders} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={200} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Réservations" fill={THEME.cyan}>
                      <LabelList dataKey="count" position="right" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData/>}
            </div>

            {/* Dernières réservations */}
            <div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md xl:col-span-2">
              <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Dernières réservations</h3>
              {charts.invoices?.length ? (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="min-w-full bg-white text-sm">
                    <thead className="bg-[#3F6592] text-white">
                      <tr>
                        <th className="px-4 py-2 text-left">N° LTA / Vol</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Transitaire</th>
                        <th className="px-4 py-2 text-left">État</th>
                        <th className="px-4 py-2 text-left">Paiement</th>
                        <th className="px-4 py-2 text-right">Montant Reservé</th>
                                                <th className="px-4 py-2 text-right">Montant Payé</th>


                      </tr>
                    </thead>
                    <tbody>
                      {charts.invoices.map((r, i) => (
                        <tr key={r.number} className={i%2 ? "bg-gray-50" : "bg-white"}>
                          <td className="px-4 py-2">{r.lta}</td>
                          <td className="px-4 py-2">{new Date(r.date).toLocaleDateString("fr-FR")}</td>
                          <td className="px-4 py-2">{r.reservedBy || "-"}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              r.etat === "Acceptée" ? "bg-green-100 text-green-700"
                                : r.etat === "Annulée" ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>{r.etat}</span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              r.status === "Payée" ? "bg-green-100 text-green-700"
                                : r.status === "Échouée" ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>{r.status}</span>
                          </td>
                        <td className="px-4 py-2 text-right">{formatMoney(r.amountBooked)}</td>
<td className="px-4 py-2 text-right">{formatMoney(r.amountPaid)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <NoData/>}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
