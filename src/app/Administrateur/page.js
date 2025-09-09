"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebare-admin";
import { FaUser } from "react-icons/fa";
import dynamic from "next/dynamic";

/* ==== Recharts dynamiques ==== */
const {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, ComposedChart,
  RadialBarChart, RadialBar,
  RadarChart, Radar, PolarAngleAxis, PolarGrid,Treemap,FunnelChart,Funnel,LabelList
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
  Treemap: dynamic(() => import("recharts").then(m => m.Treemap), { ssr: false }),
  FunnelChart: dynamic(() => import("recharts").then(m => m.FunnelChart), { ssr: false }),
Funnel:      dynamic(() => import("recharts").then(m => m.Funnel),      { ssr: false }),
LabelList:   dynamic(() => import("recharts").then(m => m.LabelList),   { ssr: false }),


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

/* Légendes uniformes (sans jaune/rose) */
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
};


const ETAT_KEYS       = ["En attente", "Acceptée", "Annulée"];
const PAIEMENT_KEYS   = ["Non payé", "Payée", "Échouée"];
const AWB_STATUS_KEYS = ["Disponibles", "Utilisés"];
const AWB_TYPE_KEYS   = ["Paper AWB", "EAP", "EAW"];

const ensureKeys = (data, keys) =>
  keys.map(k => data.find(d => d._id === k) || { _id: k, count: 0 });

const colorize = (data) =>
  data.map((d, i) => ({ ...d, fill: COLOR_BY_LABEL[d._id] || COLORS[i % COLORS.length] }));

const legendPayloadFromKeys = (keys) =>
  keys.map(k => ({ value: k, type: "square", color: COLOR_BY_LABEL[k] || THEME.slate }));

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
const AIRLINE_LABELS = { BJ:"Nouvelair", TU:"Tunisair", AF:"Air France", TO:"Transavia", LH:"Lufthansa", KL:"KLM", BA:"British Airways", EK:"Emirates", QR:"Qatar Airways", TK:"Turkish Airlines" };
const CURRENCY = "TND";

/* =============== PAGE =============== */
export default function AddTransitaire() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
      /* helpers */
const formatInt = (n) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));
  const formatMoney = (n) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 }).format(n || 0);
  const toK = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v);

  const normalize = (raw) => {
    if (raw?.totals && raw?.charts) return raw;
    const totals = {
      reservations: raw?.totalReservations ?? 0,
      airlines: raw?.totalAirlines ?? 0,
      transitaires: raw?.totalTransitaires ?? 0,
      offres: raw?.totalOffres ?? 0,
      awb: raw?.totalAwb ?? 0,
    };
    const rMonth = (raw?.reservationsByMonth ?? []).map(x => ({
      month: MONTHS[((x?._id ?? 1) - 1 + 12) % 12],
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
        topAirlines: raw?.topAirlines ?? [],
        offresByCompany: raw?.offresByCompany ?? [],
        awbByStatus,
        awbByType: raw?.awbByType ?? [],
      }
    };
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setUser(d)).catch(()=>{});
    }
    (async () => {
      try {
        const r = await fetch("/api/Dashboard/Admin");
        const d = await r.json();
        setStats(normalize(d));
      } catch {
        setMessage("Impossible de charger les statistiques.");
      }
    })();
    const handleOutside = (e) => { if (!e.target.closest(".user-menu")) setUserMenuOpen(false); };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  if (!stats) {
    return (
      <div className="flex">
        <Sidebar onToggle={setSidebarOpen} />
        <main className={`transition-all duration-300 flex-1 min-h-screen bg-[${THEME.blue}] p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="bg-white rounded-3xl p-32 shadow-lg">Chargement…</div>
        </main>
      </div>
    );
  }

  const { totals, charts } = stats;
  const totalCA = charts.reservationsByMonth?.reduce((s, m) => s + (m.totalPrice || 0), 0) || 0;
  const top5 = (charts.topAirlines ?? []).map(x => ({ name: x.name ?? AIRLINE_LABELS[x._id] ?? x._id, count: x.count ?? 0 }));

  const NoData = () => <p className="text-gray-500">Pas encore de données</p>;
const TreemapCell = (props) => {
  const { x, y, width, height, fill, name, size } = props;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#fff" />
      {width > 60 && height > 28 && (
        <>
          <text x={x + 8} y={y + 18} fontSize={12} fill="#fff">{name}</text>
          <text x={x + 8} y={y + 34} fontSize={11} fill="#fff" opacity="0.9">{size}</text>
        </>
      )}
    </g>
  );
};

// Donut simple et fiable (couleur pleine, pas de gradient)
const MiniDonut = ({ id, label, value, total, color }) => {
  const pct = total ? Math.round((value / total) * 100) : 0;

  // 1er segment = valeur (couleur thème), 2e = reste (gris clair)
  const data = [
    { name: label, value: value || 0, fill: color },
    { name: "reste", value: Math.max((total || 0) - (value || 0), 0), fill: "#E6EEF7" },
  ];

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          {/* On dessine le donut avec 2 segments, arrondis pour un effet plus premium */}
          <Pie
            data={data}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            innerRadius={58}
            outerRadius={80}
            stroke="none"
            cornerRadius={8}
            isAnimationActive
          >
            {data.map((d, i) => (
              <Cell key={`${id}-${i}`} fill={d.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="text-sm text-[#3F6592] mt-1 font-medium">{label}</div>
      <div className="text-[#3F6592] text-base">
        <strong>{value || 0}</strong>
        <span className="opacity-70"> ({pct}%)</span>
      </div>
    </div>
  );
};



// map [ {_id:1,count:3}, ... ]  =>  [{month:'Jan', count, cumul}, ...]
const toMonthlyWithCumul = (raw, key = "count") => {
  const arr = Array.from({ length: 12 }, (_, i) => ({ month: MONTHS[i], [key]: 0 }));
  (raw || []).forEach(x => {
    const m = ((x?._id || x?.month || 0) - 1);
    if (m >= 0 && m < 12) arr[m][key] = x[key] ?? x?.count ?? 0;
  });
  let cumul = 0;
  return arr.map(d => ({ ...d, [`${key}Cumul`]: (cumul += d[key] || 0) }));
};

const addCumul = (list, key, outKey) => {
  let c = 0;
  return (list || []).map(d => ({ ...d, [outKey]: (c += (d[key] || 0)) }));
};
// 1) Nouveaux transitaires & cumul
const tSeries = toMonthlyWithCumul(charts.transitairesByMonth, "count");

// 2) Nouvelles compagnies & cumul
const aSeries = toMonthlyWithCumul(charts.airlinesByMonth, "count");

// 3) Réservations/mois + cumul (tu l'avais déjà)
const resMonthly = addCumul(charts.reservationsByMonth, "count", "countCumul");

// 4) CA/mois + CA cumul (tu l'avais déjà)
const caMonthly = addCumul(
  charts.reservationsByMonth.map(x => ({ month: x.month, totalPrice: x.totalPrice || 0 })),
  "totalPrice",
  "totalPriceCumul"
);

// 5) Pies / tableaux additionnels
const byForwarder = charts.reservationsPerForwarder || [];
const caByAirline = (charts.revenueByAirline || []).map(d => ({ name: d.name, total: d.total || 0 }));
const invoices   = charts.invoices || [];




  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
<main
  className={`transition-all duration-300 flex-1 min-h-screen p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}
  style={{ backgroundColor: THEME.blue }}
>        <div className="bg-white rounded-3xl p-32 shadow-lg relative">
          {/* user menu */}
          <div className="absolute top-8 right-16">
            <div className="relative user-menu">
              <button className="flex items-center bg-[#3F6592] text-white py-3 px-10 rounded-full shadow-md" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <FaUser className="mr-2" />
                <span>{user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-[#3F6592] rounded-lg shadow-lg z-50">
                  <button onClick={() => { setUserMenuOpen(false); window.location.href = "/Administrateur/Profil"; }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Modifier profil</button>
                  <button onClick={() => { localStorage.removeItem("token"); document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; window.location.href = "/login"; }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Se déconnecter</button>
                </div>
              )}
            </div>
          </div>

          <h2 className="text-4xl font-semibold text-[#3F6592] mb-10 text-center">Tableau de bord Administrateur</h2>
          {message && <p className="text-center text-red-500 mb-6">{message}</p>}

    

  {/* KPI */}
<div className="grid grid-cols-1 md:grid-cols-6 gap-12 mb-10">

  {/* CA — carte premium, une seule ligne, thème bleu/violet/cyan */}
  <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg
                  bg-gradient-to-br from-[#3F6592] via-[#5E7FB2] to-[#56CFE1]">
    <div className="text-sm opacity-90">Chiffre d’affaires</div>
    <div className="mt-1 flex items-baseline gap-2">
      <span className="text-4xl md:text-3xl font-extrabold tracking-tight tabular-nums">
        {formatInt(totalCA)}
      </span>
      <span className="text-base font-semibold opacity-90">TND</span>
    </div>
    {/* halos doux */}
    <div className="pointer-events-none absolute -right-14 -bottom-14 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
    <div className="pointer-events-none absolute -left-10 -top-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />
  </div>

  {/* KPI mono-thème (pas de jaune/rose) */}
  <div className="text-white p-6 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#3F6592] to-[#7A4DD8]">
    <h3 className="opacity-90">Réservations</h3>
    <p className="text-3xl font-bold">{totals.reservations}</p>
  </div>

  <div className="text-white p-6 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#7A4DD8] to-[#56CFE1]">
    <h3 className="opacity-90">Compagnies</h3>
    <p className="text-3xl font-bold">{totals.airlines}</p>
  </div>

  <div className="text-white p-6 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#56CFE1] to-[#3F6592]">
    <h3 className="opacity-90">Transitaires</h3>
    <p className="text-3xl font-bold">{totals.transitaires}</p>
  </div>

  <div className="text-white p-6 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#5E7FB2] to-[#7A4DD8]">
    <h3 className="opacity-90">Offres</h3>
    <p className="text-3xl font-bold">{totals.offres}</p>
  </div>

  <div className="text-white p-6 rounded-2xl text-center shadow-md bg-gradient-to-br from-[#56CFE1] to-[#3F6592]">
    <h3 className="opacity-90">AWB</h3>
    <p className="text-3xl font-bold">{totals.awb}</p>
  </div>
</div>


          {/* ===== CHARTS (diversifiés & colorisés) ===== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">


            {/* 1) Réservations par état — Pie plein (couleurs forcées) */}
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Réservations par état</h3>
  {charts.reservationsByEtat ? (() => {
    // 1) on garantit les 3 catégories, ordre stable
    const base = ensureKeys(charts.reservationsByEtat, ETAT_KEYS);

    // 2) on nettoie les labels et on assigne une couleur à CHAQUE point de données
    const pieData = base.map((d, i) => {
      const name = String(d._id ?? "").trim();        // évite espaces/variantes
      const value = d.count ?? 0;
      return {
        name,
        value,
        fill: COLOR_BY_LABEL[name] || COLORS[i % COLORS.length], // couleur forcée
      };
    });

    const hasData = pieData.some(x => x.value > 0);
    return hasData ? (
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            outerRadius={140}
            stroke="#fff"
            strokeWidth={2}
            label={({ name, value, percent }) =>
              `${name} • ${value} (${Math.round(percent * 100)}%)`
            }
          />
          <Tooltip />
          <Legend payload={legendPayloadFromKeys(ETAT_KEYS)} />
        </PieChart>
      </ResponsiveContainer>
    ) : <NoData/>;
  })() : <NoData/>}
</div>



            {/* 4) Poids total — Area (dégradé) */}
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
              {/* 3) Composé: Réservations (barres) + CA (ligne) */}
            <div className="bg-[#f8f9fc] p-8 rounded-2xl shadow-md xl:col-span-2">
              <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Réservations + Chiffres d'affaires par mois</h3>
              {charts.reservationsByMonth?.some(x => x.count>0 || x.totalPrice>0) ? (
                <ResponsiveContainer width="100%" height={380}>
                  <ComposedChart data={charts.reservationsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={toK} />
                    <Tooltip formatter={(v, n) => n === "CA (TND)" ? formatMoney(v) : v} />
                    <Legend />
                    <Bar  yAxisId="left"  dataKey="count"      name="Réservations" fill={THEME.blue} />
<Line yAxisId="right" type="monotone" dataKey="totalPrice" name="CA (TND)" stroke={THEME.purple} strokeWidth={2} />

                  </ComposedChart>
                </ResponsiveContainer>
              ) : <NoData/>}
            </div>
      {/* 2) Statuts de paiement — 3 mini donuts (effet 3D) */}
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Statuts de paiement</h3>

  {charts.reservationsByStatus ? (() => {
    const ordered = ensureKeys(charts.reservationsByStatus, PAIEMENT_KEYS);
    const total = ordered.reduce((s, d) => s + (d.count ?? 0), 0);
    if (!total) return <NoData />;

    const items = ordered.map((d, i) => {
      const name = String(d._id ?? "").trim();
      const color = (COLOR_BY_LABEL && COLOR_BY_LABEL[name]) || COLORS[i % COLORS.length];
      return { name, value: d.count ?? 0, color };
    });

    return (
      <>
        {/* 3 donuts alignés */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 justify-items-center">
          {items.map((it, i) => (
            <MiniDonut
              key={it.name}
              id={`pay-${i}`}
              label={it.name}
              value={it.value}
              total={total}
              color={it.color}
            />
          ))}
        </div>

        {/* Clé (légende) colorée */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {items.map((it) => {
            const pct = Math.round((it.value / total) * 100);
            return (
              <div key={it.name} className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded" style={{ background: it.color }} />
                <span className="text-sm text-[#3F6592]">
                  {it.name} — <strong>{it.value}</strong>
                  <span className="opacity-70"> ({pct}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </>
    );
  })() : <NoData/>}
</div>


          


            {/* 5) Top compagnies — Bar horizontal */}
            <div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Top compagnies (Réservations)</h3>
              {top5.length ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={top5} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={140} />
                    <Tooltip />
                    <Bar dataKey="count" fill={THEME.blue} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData/>}
            </div>

        {/* 6) Offres par compagnie — Treemap (couleurs + légende + description) */}
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Offres publiées par compagnie</h3>

  {(() => {
    const raw = charts.offresByCompany ?? [];
    if (!raw.length) return <NoData />;

    // noms lisibles + couleurs du thème
    const data = raw.map((d, i) => ({
      name: AIRLINE_LABELS[d._id] ?? d._id,
      size: d.count ?? 0,
      fill: COLORS[i % COLORS.length],
    }));

    const total = data.reduce((s, d) => s + d.size, 0);
    const top = [...data].sort((a, b) => b.size - a.size)[0];

    return (
      <>
        <ResponsiveContainer width="100%" height={320}>
          <Treemap
            data={data}
            dataKey="size"
            stroke="#fff"
            content={<TreemapCell />}
          />
        </ResponsiveContainer>

        {/* Légende colorée */}
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {data.map(d => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded" style={{ background: d.fill }} />
              <span className="text-sm text-[#3F6592]">{d.name} — {d.size}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 mt-2">
          Total: {total} offres • Top: {top?.name} ({top?.size})
        </p>
      </>
    );
  })()}
</div>


     
            {/* Evolution du nombre de transitaires */}
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Évolution du nombre de transitaires</h3>
  <ResponsiveContainer width="100%" height={320}>
    <ComposedChart data={tSeries}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />
      <Bar dataKey="count" name="Nouveaux" fill={THEME.blue} />
      <Line dataKey="countCumul" name="Cumulé" stroke={THEME.pink} strokeWidth={2} />
    </ComposedChart>
  </ResponsiveContainer>
</div>

{/* Evolution du nombre de compagnies aériennes */}
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Évolution du nombre de compagnies aériennes</h3>
  <ResponsiveContainer width="100%" height={320}>
    <ComposedChart data={aSeries}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />
      <Bar dataKey="count" name="Nouvelles" fill={THEME.purple} />
      <Line dataKey="countCumul" name="Cumulé" stroke={THEME.cyan} strokeWidth={2} />
    </ComposedChart>
  </ResponsiveContainer>
</div>

{/* Evolution du nombre de réservations */}
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Évolution du nombre de réservations</h3>
  <ResponsiveContainer width="100%" height={320}>
    <ComposedChart data={resMonthly}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />
      <Bar dataKey="count" name="Réservations" fill={THEME.cyan} />
      <Line dataKey="countCumul" name="Cumulé" stroke={THEME.blue} strokeWidth={2} />
    </ComposedChart>
  </ResponsiveContainer>
</div>



{/* N° de réservations par transitaire — RadialBar donut */}
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">N° de réservations par transitaire</h3>

  {byForwarder.length ? (() => {
    const data = byForwarder.map((d, i) => ({
      name: d.name,
      value: d.count || 0,
      fill: COLORS[i % COLORS.length],
    }));
    const total = data.reduce((s, d) => s + d.value, 0);

    return (
      <>
        <ResponsiveContainer width="100%" height={320}>
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="20%" outerRadius="90%"
            startAngle={90} endAngle={-270}
            barSize={14}
            data={data}
          >
            <RadialBar
              dataKey="value"
              clockWise
              background
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </RadialBar>
            <Tooltip
              formatter={(v, _n, props) => [`${v}`, data[props?.index || 0]?.name]}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Légende (clé) colorée */}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {data.map(d => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 rounded" style={{ background: d.fill }} />
              <span className="text-sm text-[#3F6592]">
                {d.name} — <strong>{d.value}</strong>
              </span>
            </div>
          ))}
          <span className="text-sm text-slate-500">Total: {total}</span>
        </div>
      </>
    );
  })() : <NoData />}
</div>


{/* CA par compagnie aérienne — Donut Pie (couleurs forcées dans les données) */}
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">CA par compagnie aérienne</h3>

  {(() => {
    const raw = (caByAirline || []).filter(d => (d.total || 0) > 0);
    if (!raw.length) return <NoData />;

    // on injecte une couleur par slice
    const data = raw.map((d, i) => ({
      ...d,
      fill: COLORS[i % COLORS.length],
    }));

    return (
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="name"
            innerRadius={70}
            outerRadius={130}
            stroke="#fff"
            strokeWidth={2}
            labelLine={false}
            label={({ name, value, percent }) =>
              `${name} • ${formatMoney(value)} (${Math.round(percent * 100)}%)`
            }
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
          </Pie>

          <Tooltip formatter={(v) => formatMoney(v)} />

          {/* Légende synchronisée avec les couleurs */}
          <Legend payload={data.map(d => ({
            value: d.name,
            type: "square",
            color: d.fill
          }))} />
        </PieChart>
      </ResponsiveContainer>
    );
  })()}
</div>

{/* Evolution du chiffre d’affaires */}
<div className="bg-[#f8f9fc] p-8 rounded-2xl shadow-md xl:col-span-2">
              <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Évolution du chiffre d’affaires</h3>
  <ResponsiveContainer width="100%" height={320}>
    <ComposedChart data={caMonthly}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis yAxisId="left" tickFormatter={(v)=>`${v}`}/>
      <YAxis yAxisId="right" orientation="right" tickFormatter={(v)=> (v>=1000?`${(v/1000).toFixed(1)}k`:v) }/>
      <Tooltip formatter={(v,name)=> name.includes("CA") ? formatMoney(v) : v } />
      <Legend />
      <Bar yAxisId="left" dataKey="totalPrice" name="CA mensuel" fill={THEME.purple} />
      <Line yAxisId="right" dataKey="totalPriceCumul" name="CA cumulé" stroke={THEME.slate} strokeWidth={2} />
    </ComposedChart>
  </ResponsiveContainer>
</div>
{/* Tableau Facturation */}
<div className="bg-[#f8f9fc] p-6 rounded-2xl shadow-md xl:col-span-2">
  <h3 className="text-lg font-semibold text-[#3F6592] mb-4">Facturation</h3>
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead className="bg-white text-[#3F6592]">
        <tr>
          <th className="px-3 py-2 text-left">Facture N°</th>
          <th className="px-3 py-2 text-left">Date de facturation</th>
          <th className="px-3 py-2 text-left">Date d’échéance</th>
          <th className="px-3 py-2 text-left">Montant</th>
          <th className="px-3 py-2 text-left">Compagnie aérienne</th>
          <th className="px-3 py-2 text-left">Réservé par</th>
          <th className="px-3 py-2 text-left">Num LTA/réservation</th>
          <th className="px-3 py-2 text-left">Statut</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {invoices.map((r) => (
          <tr key={r.number} className="bg-white/60">
            <td className="px-3 py-2 font-medium">{r.number}</td>
            <td className="px-3 py-2">{new Date(r.date).toLocaleDateString("fr-FR")}</td>
            <td className="px-3 py-2">{new Date(r.dueDate).toLocaleDateString("fr-FR")}</td>
            <td className="px-3 py-2">{formatMoney(r.amount)}</td>
            <td className="px-3 py-2">{r.airline}</td>
            <td className="px-3 py-2">{r.reservedBy}</td>
            <td className="px-3 py-2">{r.lta}</td>
            <td className="px-3 py-2">{r.status}</td>
          </tr>
        ))}
        {!invoices.length && (
          <tr><td className="px-3 py-6 text-gray-500" colSpan={8}>Aucune facture.</td></tr>
        )}
      </tbody>
    </table>
  </div>
</div>


          </div>
        </div>
      </main>
    </div>
  );
}
