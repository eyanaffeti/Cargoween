"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; // ✅ Sidebar transitaire
import { FaUser } from "react-icons/fa";
import dynamic from "next/dynamic";

/* ==== Recharts dynamiques (pas de SSR) ==== */
const {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, ComposedChart,
  RadialBarChart, RadialBar, RadarChart, Radar, PolarAngleAxis, PolarGrid, PolarRadiusAxis,
  FunnelChart, Funnel, LabelList
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
  RadialBarChart: dynamic(() => import("recharts").then(m => m.RadialBarChart), { ssr: false }),
  RadialBar: dynamic(() => import("recharts").then(m => m.RadialBar), { ssr: false }),
  RadarChart: dynamic(() => import("recharts").then(m => m.RadarChart), { ssr: false }),
  Radar: dynamic(() => import("recharts").then(m => m.Radar), { ssr: false }),
  PolarAngleAxis: dynamic(() => import("recharts").then(m => m.PolarAngleAxis), { ssr: false }),
  PolarGrid: dynamic(() => import("recharts").then(m => m.PolarGrid), { ssr: false }),
  PolarRadiusAxis: dynamic(() => import("recharts").then(m => m.PolarRadiusAxis), { ssr: false }),
  FunnelChart: dynamic(() => import("recharts").then(m => m.FunnelChart), { ssr: false }),
  Funnel: dynamic(() => import("recharts").then(m => m.Funnel), { ssr: false }),
  LabelList: dynamic(() => import("recharts").then(m => m.LabelList), { ssr: false })
};

/* ==== Thème (bleu / violet / cyan uniquement) ==== */
const THEME = {
  blue:   "#3F6592", // principal
  indigo: "#5E7FB2", // intermédiaire
  purple: "#7A4DD8",
  cyan:   "#56CFE1",
  slate:  "#94A3B8",
};
const COLORS = [THEME.blue, THEME.purple, THEME.cyan, THEME.indigo, THEME.slate];

/* Légendes uniformes */
const COLOR_BY_LABEL = {
  // Réservations → état
  "En attente": THEME.cyan,
  "Acceptée":   THEME.blue,
  "Annulée":    THEME.purple,

  // Paiement → statut
  "Non payé": THEME.cyan,
  "Payée":    THEME.blue,
  "Échouée":  THEME.purple,

  // AWB → dispo / utilisés
  "Disponibles": THEME.cyan,
  "Utilisés":    THEME.blue,

  // AWB → type
  "Paper AWB": THEME.blue,
  "EAP":       THEME.cyan,
  "EAW":       THEME.purple,

  // Marchandise → type d’envoi
  "Standard": THEME.blue,
  "Température contrôlée": THEME.cyan,
  "Cargo Aircraft": THEME.purple,
};

const ETAT_KEYS       = ["En attente", "Acceptée", "Annulée"];
const PAIEMENT_KEYS   = ["Non payé", "Payée", "Échouée"];
const AWB_STATUS_KEYS = ["Disponibles", "Utilisés"];
const AWB_TYPE_KEYS   = ["Paper AWB", "EAP", "EAW"];
const MARCH_TYPES     = ["Standard", "Température contrôlée", "Cargo Aircraft"];

const ensureKeys = (data, keys) => keys.map(k => data?.find(d => (d._id ?? d.name) === k) || { _id: k, count: 0 });
const colorize = (data) => (data || []).map((d, i) => ({ ...d, fill: COLOR_BY_LABEL[d._id] || COLOR_BY_LABEL[d.name] || COLORS[i % COLORS.length] }));
const legendPayloadFromKeys = (keys) => keys.map(k => ({ value: k, type: "square", color: COLOR_BY_LABEL[k] || THEME.slate }));

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
const AIRLINE_LABELS = { BJ:"Nouvelair", TU:"Tunisair", AF:"Air France", TO:"Transavia", LH:"Lufthansa", KL:"KLM", BA:"British Airways", EK:"Emirates", QR:"Qatar Airways", TK:"Turkish Airlines" };
const CURRENCY = "TND";

/* Helpers format */
const formatInt = (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));
const formatMoney = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 }).format(n || 0);
const toK = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v);

/* Normalisation API */
const normalize = (raw) => {
  if (raw?.totals && raw?.charts) return raw;

  const totals = {
    reservations: raw?.totalReservations ?? 0,
    marchandises: raw?.totalMarchandises ?? 0,
    ca: raw?.totalCA ?? 0,
    awbDisponibles: raw?.awbDisponibles ?? 0,
    awbUtilises: raw?.awbUtilises ?? 0,
    subaccounts: raw?.totalSubaccounts ?? 0,
    totalWeight: raw?.totalWeight ?? 0,
    subAccounts: raw?.subAccounts ?? [],

  };

  const rMonth = (raw?.reservationsByMonth ?? []).map(x => ({
    month: MONTHS[((x?._id ?? x?.month ?? 1) - 1 + 12) % 12],
    count: x?.count ?? 0,
    totalWeight: x?.totalWeight ?? 0,
    totalPrice: x?.totalPrice ?? 0,
  }));

  const awbByStatus = (raw?.awbByStatus ?? []).map(x => ({
    _id: x?._id === true ? "Utilisés" : x?._id === false ? "Disponibles" : String(x?._id ?? ""),
    count: x?.count ?? 0,
  }));

  return {
    totals,
    charts: {
      reservationsByEtat: raw?.reservationsByEtat ?? [],
      reservationsByStatus: raw?.reservationsByStatus ?? [],
      reservationsByMonth: rMonth,
topAirlines: (raw?.topAirlines ?? []).map(a => ({
  name: AIRLINE_LABELS[a?.name] ?? a?.name ?? AIRLINE_LABELS[a?._id] ?? a?._id,
  count: a?.count ?? 0,
})),

      awbByStatus,
      awbByType: raw?.awbByType ?? [],
      marchandiseByType: raw?.marchandiseByType ?? [],
      funnel: raw?.funnel ?? [], // [{stage:"Recherche", value:120}, ...]
      subAccountsPerf: raw?.subAccountsPerf ?? [], // [{name:"Ali (sec)", count: 12}]
    }
  };
};

/* Utils */
const NoData = () => <p className="text-gray-500">Pas encore de données</p>;

const MiniDonut = ({ id, label, value, total, color }) => {
  const pct = total ? Math.round((value / total) * 100) : 0;
  const data = [
    { name: label, value: value || 0, fill: color },
    { name: "reste", value: Math.max((total || 0) - (value || 0), 0), fill: "#E6EEF7" },
  ];
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie data={data} dataKey="value" startAngle={90} endAngle={-270} innerRadius={52} outerRadius={74} stroke="none" cornerRadius={8}>
            {data.map((d, i) => (<Cell key={`${id}-${i}`} fill={d.fill} />))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-sm text-[#3F6592] mt-1 font-medium">{label}</div>
      <div className="text-[#3F6592] text-base"><strong>{value || 0}</strong><span className="opacity-70"> ({pct}%)</span></div>
    </div>
  );
};

/* =============== PAGE =============== */
export default function DashboardTransitaire() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true); // ✅ Loader

  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
const [opsDist, setOpsDist] = useState(null);

  const isMainForwarder = useMemo(() => {
    const r = (user?.role || "").toLowerCase();
    return r.includes("transitaire") && !r.includes("second");
  }, [user]);
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const rUser = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        const me = await rUser.json();
        setUser(me);

        const r = await fetch(`/api/Dashboard/Transitaire?userId=${me._id}&role=${encodeURIComponent(me.role || "transitaire")}`);
        const d = await r.json();
        setStats(d);
      } catch (err) {
        setMessage("Impossible de charger les statistiques.");
      } finally {
        setLoading(false); // ✅ Arrêt du loader
      }
    };
    fetchAll();
  }, []);

  // ✅ Loader plein écran
 if (loading) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50">
      <img src="/preloader.gif" alt="Chargement..." className="w-28 h-28 mb-4" />
      <p className="text-[#3F6592] text-lg font-semibold">
        Chargement du tableau de bord...
      </p>
    </div>
  );
}


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

  const { totals, charts } = stats;
  const totalCA = charts.reservationsByMonth?.reduce((s, m) => s + (m.totalPrice || 0), 0) || 0;

  // Données dérivées
  const payOrdered = ensureKeys(charts.reservationsByStatus, PAIEMENT_KEYS);
  const payTotal = payOrdered.reduce((s, d) => s + (d.count || 0), 0);

  // Marchandise → funnel et répartition
  const marchType = colorize(ensureKeys(charts.marchandiseByType, MARCH_TYPES).map(x => ({ _id: x._id, count: x.count })));
  const funnel = (charts.funnel || []).length ? charts.funnel : [
    { stage: "Recherche", value: 0 },
    { stage: "Sélection offre", value: 0 },
    { stage: "Détails marchandise", value: 0 },
    { stage: "Paiement", value: 0 },
    { stage: "Confirmée", value: 0 },
  ];
// ---- A) Evolution mensuelle : barres (nb) + ligne (cumul)
let _cum = 0;
const evoReservations = (charts.reservationsByMonth || []).map(m => {
  _cum += m.count || 0;
  return { month: m.month, count: m.count || 0, cum: _cum };
});
// ---- C) Pareto compagnies: barres + ligne % cumulé
const paretoAirlines = (() => {
  const arr = (charts.topAirlines || [])
    .map(a => ({ name: a?.name || "--", count: a?.count || 0 }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 10);

  const total = arr.reduce((s,d)=>s+d.count,0) || 1;
  let cum = 0;
  return arr.map(d => {
    cum += d.count;
    return { ...d, cumPct: Math.round((cum / total) * 100) };
  });
})();

  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`} style={{ backgroundColor: THEME.blue }}>
        <div className="bg-white rounded-3xl p-10 md:p-16 shadow-lg relative">

          {/* user menu */}
          <div className="absolute top-8 right-8">
            <div className="relative user-menu">
              <button className="flex items-center bg-[#3F6592] text-white py-3 px-6 md:px-8 rounded-full shadow-md" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <FaUser className="mr-2" />
                <span>{user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-[#3F6592] rounded-lg shadow-lg z-50">
                  <button onClick={() => { setUserMenuOpen(false); router.push("/Transitaire/Profil"); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Modifier profil</button>
                  <button onClick={() => { localStorage.removeItem("token"); document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; window.location.href = "/login"; }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Se déconnecter</button>
                </div>
              )}
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-semibold text-[#3F6592] mb-8 text-center">Tableau de bord Transitaire</h2>
          {message && <p className="text-center text-red-500 mb-6">{message}</p>}

          {/* KPI */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 md:gap-8 mb-10">
            {/* CA */}
           <div className="relative overflow-hidden rounded-2xl p-4 text-white shadow-lg
                  bg-gradient-to-br from-[#3F6592] via-[#5E7FB2] to-[#56CFE1]">
    <div className="text-sm opacity-90">Valeur de mes réservations</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-extrabold tracking-tight tabular-nums">{formatInt(totalCA)}</span>
                <span className="text-base font-semibold opacity-90">TND</span>
              </div>
              <div className="pointer-events-none absolute -right-14 -bottom-14 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -left-10 -top-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />
            </div>

            <div className="text-white p-6 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#3F6592] to-[#7A4DD8]">
              <h3 className="opacity-90">Réservations</h3>
              <p className="text-3xl font-bold">{totals.reservations}</p>
            </div>

            <div className="text-white p-6 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#7A4DD8] to-[#56CFE1]">
              <h3 className="opacity-90">Marchandises</h3>
              <p className="text-3xl font-bold">{totals.marchandises}</p>
            </div>

            <div className="text-white p-6 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#56CFE1] to-[#3F6592]">
              <h3 className="opacity-90">Poids total</h3>
              <p className="text-3xl font-bold">{formatInt(totals.totalWeight)}<span className="text-lg ml-1">kg</span></p>
            </div>

            {/* KPI visibles uniquement pour transitaire principal */}
            
              <>
                <div className="text-white p-6 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#5E7FB2] to-[#7A4DD8]">
                  <h3 className="opacity-90">AWB disponibles</h3>
                  <p className="text-3xl font-bold">{totals.awbDisponibles}</p>
                </div>
                <div className="text-white p-6 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#56CFE1] to-[#3F6592]">
                  <h3 className="opacity-90">AWB utilisés</h3>
                  <p className="text-3xl font-bold">{totals.awbUtilises}</p>
                </div>
              </>
            

            {!isMainForwarder && (
              <div className="md:col-span-2 xl:col-span-3 text-[#3F6592] bg-[#f0f5fb] p-6 rounded-2xl border border-[#e3eaf5]">
                <p className="text-sm">Note : En tant que <b>transitaire secondaire</b>, vous ne pouvez pas ajouter des sous-comptes .</p>
              </div>
            )}
          </div>

          {/* ===== CHARTS ===== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

            {/* 1) Réservations par état — Pie */}
            <div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Réservations par état</h3>
              {charts.reservationsByEtat ? (() => {
                const base = ensureKeys(charts.reservationsByEtat, ETAT_KEYS);
                const pieData = base.map((d, i) => ({ name: String(d._id), value: d.count || 0, fill: COLOR_BY_LABEL[String(d._id)] || COLORS[i % COLORS.length] }));
                const hasData = pieData.some(x => x.value > 0);
                return hasData ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={120} stroke="#fff" strokeWidth={2} label />
                      <Tooltip />
                      <Legend payload={legendPayloadFromKeys(ETAT_KEYS)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <NoData/>;
              })() : <NoData/>}
            </div>

 {/* 2) Statuts de paiement — Histogramme (violet) */}
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">
    Statuts de paiement de mes réservations
  </h3>

  {payTotal ? (() => {
    const data = payOrdered.map(d => ({
      status: String(d._id),
      count: d.count || 0
    }));
    const maxY = Math.max(5, ...data.map(d => d.count || 0));

    return (
      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" />
          <YAxis allowDecimals={false} domain={[0, maxY]} />
          <Tooltip />
          <Legend />
          {/* 🎨 Tout en violet */}
          <Bar dataKey="count" name="Réservations" fill={THEME.purple} radius={[6,6,0,0]}>
            <LabelList dataKey="count" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  })() : <NoData/>}
</div>



           

            {/* 4) Poids total transporté — Area */}
            <div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Poids total transporté (kg)</h3>
              {charts.reservationsByMonth?.some(x => x.totalWeight>0) ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={charts.reservationsByMonth}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={THEME.purple} stopOpacity={0.5}/>
                        <stop offset="100%" stopColor={THEME.purple} stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="totalWeight" stroke={THEME.purple} fill="url(#weightGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <NoData/>}
            </div>
{/* 8) AWB par type — Pie (plein) */}

              <>
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">
    Répartition des AWB par type
  </h3>

  {charts.awbByType ? (() => {
    const data = colorize(ensureKeys(charts.awbByType, AWB_TYPE_KEYS));
    const hasData = data.some(x => (x.count || 0) > 0);
    if (!hasData) return <NoData/>;

    return (
      <ResponsiveContainer width="100%" height={360}>
        <PieChart margin={{ top: 30, right: 0, bottom: 2, left: 0 }}>
          <Pie
            data={data}
            dataKey="count"
            nameKey="_id"
            cx="50%"
            cy="42%"            // ↓ remonte un peu le pie pour laisser de la place à la légende
            outerRadius={130}
            stroke="#fff"
            strokeWidth={2}
            label={({ name, value, percent }) =>
              `${name} • ${value} (${Math.round(percent * 100)}%)`
            }
          >
            {data.map((d) => (
              <Cell key={d._id} fill={d.fill} />
            ))}
          </Pie>

          <Tooltip />

          {/* Légende sous le graphique, centrée, avec nos couleurs */}
          <Legend
            verticalAlign="bottom"
            align="center"
            layout="horizontal"
            iconType="square"
            wrapperStyle={{ marginTop: 8 }}
            payload={legendPayloadFromKeys(AWB_TYPE_KEYS)}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  })() : <NoData/>}
</div></>
   
           

            {/* 7) AWB — RadialBar (visibles seulement pour transitaire principal) */}
            
              <>
                <div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
                  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">AWB disponibles vs utilisés</h3>
                  {charts.awbByStatus ? (() => {
                    const ordered = ensureKeys(charts.awbByStatus, AWB_STATUS_KEYS);
                    const data = ordered.map((d, i) => ({ name: String(d._id).trim(), value: d.count || 0, fill: COLOR_BY_LABEL[String(d._id).trim()] || COLORS[i % COLORS.length] }));
                    const total = data.reduce((s, d) => s + d.value, 0);
                    const hasData = total > 0;
                    return hasData ? (
                      <>
                        <ResponsiveContainer width="100%" height={320}>
                          <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="85%" barSize={18} data={data}>
                            <RadialBar background dataKey="value" label={{ position: "insideStart", fill: "#fff" }}>
                              {data.map((d) => (<Cell key={d.name} fill={d.fill} />))}
                            </RadialBar>
                            <Tooltip formatter={(v, n, ctx) => {
                              const entry = data[ctx?.index ?? 0];
                              const pct = total ? Math.round((entry.value / total) * 100) : 0;
                              return [`${v} (${pct}%)`, entry.name];
                            }} />
                          </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                          {data.map(d => {
                            const pct = total ? Math.round((d.value / total) * 100) : 0;
                            return (
                              <div key={d.name} className="flex items-center gap-2">
                                <span className="inline-block w-3.5 h-3.5 rounded" style={{ background: d.fill }} />
                                <span className="text-sm text-[#3F6592]">{d.name} — <strong>{d.value}</strong><span className="opacity-70"> ({pct}%)</span></span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : <NoData/>;
                  })() : <NoData/>}
                </div>


     {/* 5) Marchandises par type d’envoi — Bar chart */}
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Marchandises par type d’envoi</h3>
  {marchType.some(x => (x.count || x.value || 0) > 0) ? (() => {
    const data = marchType.map((d, i) => ({
      type: d._id,
      count: d.count || d.value || 0,
      fill: d.fill || COLORS[i % COLORS.length]
    }));
    const maxY = Math.max(5, ...data.map(d => d.count));

    return (
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis allowDecimals={false} domain={[0, maxY]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" name="Expéditions">
            {data.map((d, i) => <Cell key={d.type} fill={d.fill} />)}
            <LabelList dataKey="count" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  })() : <NoData/>}
</div>


{/* Opérationnel : En cours / Livrées / En attente */}
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">
    Livraisons (opérationnel)
  </h3>

  {charts.livraisonDist && charts.livraisonDist.some(d => d.value > 0) ? (
    <ResponsiveContainer width="100%" height={360}>
      <PieChart margin={{ bottom: 24 }}>
        <Pie
          data={charts.livraisonDist}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          outerRadius={120}
          stroke="#fff"
          strokeWidth={2}
          label={({ name, value, percent }) =>
            `${name} • ${value} (${Math.round(percent * 100)}%)`
          }
        >
          {charts.livraisonDist.map(d => <Cell key={d.name} fill={d.fill} />)}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" align="center" iconType="square" />
      </PieChart>
    </ResponsiveContainer>
  ) : <NoData/>}
</div>





              </>
            
            {/* 6) Top compagnies — Bar chart (classement) */}
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">
    Top compagnies (mes réservations)
  </h3>

  {charts.topAirlines?.length ? (() => {
    // tri décroissant + limite 10
    const data = [...charts.topAirlines]
      .map(a => ({ name: a?.name || "--", count: a?.count || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const maxX = Math.max(5, ...data.map(d => d.count));

    return (
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} domain={[0, maxX]} />
          <YAxis type="category" dataKey="name" width={180} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" name="Réservations" fill={THEME.cyan}>
            <LabelList dataKey="count" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  })() : <NoData/>}
</div>
            {/* Évolution du nombre de réservations */}
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md xl:col-span-2">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">
    Évolution du nombre de réservations
  </h3>

  {evoReservations.some(d => d.count > 0) ? (
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart data={evoReservations}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" allowDecimals={false} />
        <YAxis yAxisId="right" orientation="right" unit="" domain={[0, Math.max(...evoReservations.map(d=>d.cum), 5)]}/>
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="count" name="Réservations" fill={THEME.blue} radius={[6,6,0,0]} />
        <Line yAxisId="right" type="monotone" dataKey="cum" name="Total cumulé" stroke={THEME.cyan} strokeWidth={2}/>
      </ComposedChart>
    </ResponsiveContainer>
  ) : <NoData/>}
</div>


          




          </div>
        </div>
      </main>
    </div>
  );
}