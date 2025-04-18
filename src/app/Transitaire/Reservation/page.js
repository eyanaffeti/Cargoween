"use client";
import { useState, useEffect } from "react";
import { FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaUser, FaPlane } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";




export default function Reservation() {
    const [loading, setLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [searchAirline, setSearchAirline] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const airlineNames = {
    BJ: "Nouvelair",
    AZ: "ITA Airways",
    AT: "Royal Air Maroc",
    A3: "Aegean Airlines",
    TK: "Turkish Airlines",
    AF: "Air France",
    MS: "EgyptAir",
    AH: "Air Algérie",
    QR: "Qatar Airways",
    LH: "Lufthansa",
    TU: "Tunisair",
    EK: "Emirates",
    UG: "Tunisair Express",
    AA: "American Airlines",
    AC: "Air Canada",
    BA: "British Airways",
    DL: "Delta Air Lines",
    KL: "KLM Royal Dutch Airlines",
    SU: "Aeroflot Russian Airlines",
    UA: "United Airlines",
    AI: "Air India",
    QF: "Qantas Airways",
    NH: "All Nippon Airways",
    SQ: "Singapore Airlines",
    CX: "Cathay Pacific",
    KE: "Korean Air",
    ET: "Ethiopian Airlines"
  };
  
  const airports = [
    { code: "TUN", name: "Tunis-Carthage Airport" },
    { code: "CDG", name: "Paris Charles de Gaulle" },
    { code: "ORY", name: "Paris Orly Airport" },
    { code: "FRA", name: "Frankfurt Airport" },
    { code: "IST", name: "Istanbul Airport" },
    { code: "CAI", name: "Cairo Airport" },
    { code: "CMN", name: "Casablanca Airport" },
    { code: "ALG", name: "Algiers Houari Boumediene" },
    { code: "JFK", name: "John F. Kennedy International Airport" },
    { code: "LHR", name: "London Heathrow Airport" },
    { code: "DXB", name: "Dubai International Airport" },
    { code: "HND", name: "Tokyo Haneda Airport" },
    { code: "LAX", name: "Los Angeles International Airport" },
    { code: "AMS", name: "Amsterdam Schiphol Airport" },
    { code: "SIN", name: "Singapore Changi Airport" },
    { code: "SYD", name: "Sydney Kingsford Smith Airport" },
    { code: "PEK", name: "Beijing Capital International Airport" },
    { code: "GRU", name: "São Paulo–Guarulhos International Airport" },
    { code: "MEX", name: "Mexico City International Airport" },
    { code: "NRT", name: "Tokyo Narita Airport" }
  ];
  
  

  
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUser(data);
    };
    fetchUser();
  }, []);

  const handleSearch = async () => {
    setMessage("");
    setResults([]);
    setLoading(true);
  
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(date);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  
    const allFlights = [];
  
    try {
      for (const currentDate of dates) {
        const response = await fetch("/api/amadeus/flights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin: from, destination: to, date: currentDate }),
        });
  
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          allFlights.push(...data);
        }
      }
  
      if (allFlights.length === 0) {
        setMessage("Aucun vol trouvé pour les 7 jours sélectionnés.");
        setLoading(false);
        return;
      }
  
      const grouped = {};
      const tags = {};
      const datesSet = new Set(dates);
  
      allFlights.forEach((flight) => {
        const airline = flight.validatingAirlineCodes[0];
        const price = parseFloat(flight.price.total);
        const segment = flight.itineraries[0].segments[0];
        const flightDate = segment.departure.at.split("T")[0];
        const flightNumber = segment.carrierCode + segment.number;
  
        if (!datesSet.has(flightDate)) return;
  
        if (!grouped[airline]) grouped[airline] = {};
        grouped[airline][flightDate] = { price, flightNumber };
      });
  
      dates.forEach((date) => {
        let cheapestPrice = Infinity;
        let bestPrice = Infinity;
  
        Object.keys(grouped).forEach((airline) => {
          const flight = grouped[airline][date];
          if (flight) {
            if (flight.price < cheapestPrice) cheapestPrice = flight.price;
            bestPrice = Math.min(bestPrice, flight.price);
          }
        });
  
        Object.keys(grouped).forEach((airline) => {
          const flight = grouped[airline][date];
          if (flight) {
            if (!tags[date]) tags[date] = {};
            tags[date][airline] = [];
  
            if (flight.price === cheapestPrice) tags[date][airline].push("Cheap");
            if (flight.price <= bestPrice * 1.2) tags[date][airline].push("Best");
            if (Math.random() > 0.7) tags[date][airline].push("Green");
          }
        });
      });
  
      setResults({ grouped, tags, dates });
    } catch (err) {
      console.error(err);
      setMessage("Erreur serveur");
    }
  
    setLoading(false);
  };
  

  const filteredAirlines = Object.entries(results.grouped || {}).filter(([airline]) =>
    airlineNames[airline]?.toLowerCase().includes(searchAirline.toLowerCase()) ||
    airline.toLowerCase().includes(searchAirline.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-white rounded-3xl p-10 shadow-lg relative">
        <div className="absolute top-14 right-8">

<div className="relative user-menu">
<button
className="flex items-center bg-[#3F6592] text-white py-1 px-4 rounded-full shadow-md"
onClick={() => setUserMenuOpen(!userMenuOpen)}
>
<FaUser className="mr-2" />
<span>{user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}</span>
</button>

{userMenuOpen && (
<div className="absolute right-0 mt-2 w-48 bg-white text-[#3F6592] rounded-lg shadow-lg z-50">
<button
  onClick={() => {
    setUserMenuOpen(false);
    window.location.href = "/Transitaire/Profil"; 
  }}
  className="w-full text-left px-4 py-2 hover:bg-gray-100"
>
  Modifier profil
</button>
<button
  onClick={() => {
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  }}
  className="w-full text-left px-4 py-2 hover:bg-gray-100"
>
  Se déconnecter
</button>
</div>
)}
</div>
</div>
<h2 className="text-2xl font-bold text-center text-[#3F6592]  mt-24 mb-10">🔍 Recherche de Vols </h2>
       
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-24">
        
          <div className="relative">
          <FaPlane className="absolute top-3 left-3 text-gray-400" />  
          <input type="text" placeholder="Rechercher compagnie..." 
          value={searchAirline} onChange={(e) => setSearchAirline(e.target.value)}
          className="w-full p-3 pl-10 border-2 border-[#3F6592] rounded-lg"/>
          </div>
          


           {/* Champ FROM avec suggestions */}
<div className="relative">
  <FaPlaneDeparture className="absolute top-3 left-3 text-gray-400" />
  <input
    type="text"
    placeholder="Aéroport de départ (ex: TUN)"
    value={from}
    onChange={(e) => {
      setFrom(e.target.value);
      setFromSuggestions(
        airports.filter(a =>
          a.code.toLowerCase().includes(e.target.value.toLowerCase()) ||
          a.name.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    }}
    className="w-full p-3 pl-10 border-2 border-[#3F6592] rounded-lg"
  />
  {fromSuggestions.length > 0 && (
    <ul className="absolute z-10 bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto w-full">
      {fromSuggestions.map((a, i) => (
        <li
          key={i}
          onClick={() => {
            setFrom(a.code);
            setFromSuggestions([]);
          }}
          className="px-4 py-2 hover:bg-[#3F6592] hover:text-white cursor-pointer"
        >
          {a.name} ({a.code})
        </li>
      ))}
    </ul>
  )}
</div>

{/* Champ TO avec suggestions */}
<div className="relative">
  <FaPlaneArrival className="absolute top-3 left-3 text-gray-400" />
  <input
    type="text"
    placeholder="Aéroport d’arrivée (ex: CDG)"
    value={to}
    onChange={(e) => {
      setTo(e.target.value);
      setToSuggestions(
        airports.filter(a =>
          a.code.toLowerCase().includes(e.target.value.toLowerCase()) ||
          a.name.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    }}
    className="w-full p-3 pl-10 border-2 border-[#3F6592] rounded-lg"
  />
  {toSuggestions.length > 0 && (
    <ul className="absolute z-10 bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto w-full">
      {toSuggestions.map((a, i) => (
        <li
          key={i}
          onClick={() => {
            setTo(a.code);
            setToSuggestions([]);
          }}
          className="px-4 py-2 hover:bg-[#3F6592] hover:text-white cursor-pointer"
        >
          {a.name} ({a.code})
        </li>
      ))}
    </ul>
  )}
</div>

            <div className="relative">
              <FaCalendarAlt className="absolute top-3 left-3 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 pl-10 border-2 border-[#3F6592] rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSearch}
              className="bg-[#0EC953] hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full"
            >
              Rechercher
            </button>
          </div>
          {loading && (
  <div className="flex justify-center items-center my-10">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#3F6592] border-opacity-75"></div>
    <span className="ml-3 text-[#3F6592] font-medium">Chargement des vols...</span>
  </div>
)}

          {message && <p className="text-red-500 mt-5">{message}</p>}
          {results?.grouped && (
  <div className="overflow-x-auto mt-10 rounded-lg shadow-md">
    <table className="min-w-full bg-white border-collapse text-sm rounded-lg overflow-hidden shadow-md">
      <thead className="bg-[#3F6592] text-white">
        <tr>
          <th className="py-3 px-4 text-left">✈️ Compagnie</th>
          {results.dates.map(date => (
            <th key={date} className="py-3 px-4 text-center">
              {new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filteredAirlines.map(([airline, flights], idx) => (
          <tr key={airline} className={`${idx % 2 === 0 ? "bg-gray-100" : "bg-white"} border-b`}>
            <td className="py-3 px-4 flex items-center gap-2">
              <img
                src={`https://images.kiwi.com/airlines/64/${airline}.png`}
                alt={airline}
                className="w-34 h-18 object-contain"
                onError={(e) => { e.target.onerror = null; e.target.src = '/fallback-logo.png'; }}
              />
              <div>
                <div className="text-sm font-semibold">{airline}</div>
                <div className="text-xs text-gray-600">{airlineNames?.[airline] || ""}</div>
              </div>
            </td>
            {results.dates.map(date => {
              const flight = flights[date];
              const tagList = results.tags?.[date]?.[airline] || [];

              return (
                <td key={date} className="py-3 px-4 text-center">
                  {flight ? (
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-semibold text-black text-sm mb-1">
                        {flight.price.toFixed(2)} €
                      </span>
                      <div className="flex gap-1 flex-wrap justify-center">
                        {tagList.map(tag => (
                          <span
                            key={tag}
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white
                              ${tag === "Cheap" ? "bg-purple-600" :
                                tag === "Best" ? "bg-blue-600" :
                                tag === "Green" ? "bg-green-600" : "bg-gray-500"
                              }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{flight.flightNumber}</div>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


        </div>
      </main>
    </div>
  );
}
