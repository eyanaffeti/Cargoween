"use client";
import { useState, useEffect } from "react";
import { FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaUser, FaPlane } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import FlightDetailsModal from "@/components/FlightDetailsModal";





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
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [cargoData, setCargoData] = useState({
    pieces: 1,
    dimensions: [{ longueur: "", largeur: "", hauteur: "" }],
    poids: "",
    poidsParPiece: true,
    stackable: false,
    turnable: false,
    temperature: "Non requis",
    suiviTemperature: false,
    conteneurActif: false,
    typeMarchandise: "Normale",
    lithiumBattery: false,
    diplomatique: false,
    express: false,
    screened: false
  });
  

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
    { code: "TUN", name: "Tunis-Carthage Airport", countryCode: "TN" },
    { code: "CDG", name: "Paris Charles de Gaulle", countryCode: "FR" },
    { code: "FRA", name: "Frankfurt Airport", countryCode: "DE" },
    { code: "LAX", name: "Los Angeles International", countryCode: "US" },
    { code: "DJE", name: "Djerba-Zarzis Airport", countryCode: "TN" },
    { code: "LAX", name: "Los Angeles International", countryCode: "US" },
    { code: "NBE", name: "Enfidha-Hammamet International Airport", countryCode: "TN" },
    { code: "IST", name: "Istanbul Airport", countryCode: "TR" },
    { code: "ORY", name: "Paris Orly Airport", countryCode: "FR" },
    { code: "CAI", name: "Cairo Airport", countryCode: "EG" },
    { code: "CMN", name: "Casablanca Mohammed V", countryCode: "MA" },
    { code: "ALG", name: "Algiers Houari Boumediene", countryCode: "DZ" },
    { code: "JFK", name: "John F. Kennedy International", countryCode: "US" },
    { code: "LHR", name: "London Heathrow", countryCode: "GB" },
    { code: "LGW", name: "London Gatwick", countryCode: "GB" },
    { code: "DXB", name: "Dubai International Airport", countryCode: "AE" },
    { code: "HND", name: "Tokyo Haneda", countryCode: "JP" },
    { code: "NRT", name: "Tokyo Narita", countryCode: "JP" },
    { code: "LAX", name: "Los Angeles International", countryCode: "US" },
    { code: "ORD", name: "Chicago O'Hare", countryCode: "US" },
    { code: "ATL", name: "Atlanta Hartsfield-Jackson", countryCode: "US" },
    { code: "AMS", name: "Amsterdam Schiphol", countryCode: "NL" },
    { code: "MAD", name: "Madrid Barajas", countryCode: "ES" },
    { code: "BCN", name: "Barcelona El Prat", countryCode: "ES" },
    { code: "FCO", name: "Rome Fiumicino", countryCode: "IT" },
    { code: "MXP", name: "Milan Malpensa", countryCode: "IT" },
    { code: "ZRH", name: "Zurich Airport", countryCode: "CH" },
    { code: "GVA", name: "Geneva Airport", countryCode: "CH" },
    { code: "VIE", name: "Vienna International", countryCode: "AT" },
    { code: "BRU", name: "Brussels Airport", countryCode: "BE" },
    { code: "CPT", name: "Cape Town International", countryCode: "ZA" },
    { code: "JNB", name: "Johannesburg OR Tambo", countryCode: "ZA" },
    { code: "BKK", name: "Bangkok Suvarnabhumi", countryCode: "TH" },
    { code: "SIN", name: "Singapore Changi", countryCode: "SG" },
    { code: "KUL", name: "Kuala Lumpur International", countryCode: "MY" },
    { code: "SYD", name: "Sydney Kingsford Smith", countryCode: "AU" },
    { code: "MEL", name: "Melbourne Airport", countryCode: "AU" },
    { code: "PEK", name: "Beijing Capital", countryCode: "CN" },
    { code: "PVG", name: "Shanghai Pudong", countryCode: "CN" },
    { code: "ICN", name: "Seoul Incheon", countryCode: "KR" },
    { code: "DEL", name: "Indira Gandhi Intl (Delhi)", countryCode: "IN" },
    { code: "BOM", name: "Chhatrapati Shivaji (Mumbai)", countryCode: "IN" },
    { code: "GRU", name: "São Paulo Guarulhos", countryCode: "BR" },
    { code: "EZE", name: "Buenos Aires Ezeiza", countryCode: "AR" },
    { code: "SCL", name: "Santiago Arturo Merino Benítez", countryCode: "CL" },
    { code: "MEX", name: "Mexico City Benito Juárez", countryCode: "MX" },
    { code: "YUL", name: "Montréal-Trudeau", countryCode: "CA" },
    { code: "YYZ", name: "Toronto Pearson", countryCode: "CA" },
    { code: "YVR", name: "Vancouver International", countryCode: "CA" },
    { code: "DOH", name: "Hamad International (Doha)", countryCode: "QA" },
    { code: "JED", name: "King Abdulaziz Intl (Jeddah)", countryCode: "SA" }
  ];
  
  
  
  const freightRatesPerKg = {
  BJ: 1.9,
  AZ: 2.3,
  AT: 2.0,
  A3: 2.4,
  TK: 2.8,
  AF: 2.5,
  MS: 2.2,
  AH: 2.1,
  QR: 3.0,
  LH: 2.6,
  TU: 1.5,
  EK: 2.7,
  UG: 1.6,
  // Ajoute les autres compagnies selon ton besoin...
};

  

  
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
        const segments = flight.itineraries[0].segments;
      
        const validSegment = segments.find(
          seg => seg.departure.iataCode === from && seg.arrival.iataCode === to
        );
      
        if (!validSegment) return; // ignorer les vols qui ne correspondent pas
      
        const flightDate = validSegment.departure.at.split("T")[0];
        const flightNumber = validSegment.carrierCode + validSegment.number;
      
        if (!datesSet.has(flightDate)) return;
      
        if (!grouped[airline]) grouped[airline] = {};
        grouped[airline][flightDate] = {
          price,
          flightNumber,
          segments, // 👈 on ajoute les segments ici
        };
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
    <ul className="absolute z-50 bg-white border border-gray-300 rounded-lg mt-2 shadow-lg max-h-60 overflow-y-auto w-full animate-fade-in">
      {fromSuggestions.map((a, i) => (
        <li
          key={i}
          onClick={() => {
            setFrom(a.code);
            setFromSuggestions([]);
          }}
          className="px-4 py-2 hover:bg-[#3F6592] hover:text-white transition-all duration-200 cursor-pointer flex items-center gap-3"
        >
          <img
            src={`https://flagcdn.com/32x24/${a.countryCode.toLowerCase()}.png`}
            alt={a.countryCode}
            className="w-6 h-4 object-contain rounded-sm shadow-sm border"
          />
          <div className="text-sm">
            <div className="font-semibold">{a.name}</div>
            <div className="text-xs text-gray-500">({a.code})</div>
          </div>
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
    <ul className="absolute z-50 bg-white border border-gray-300 rounded-lg mt-2 shadow-lg max-h-60 overflow-y-auto w-full animate-fade-in">
      {toSuggestions.map((a, i) => (
        <li
          key={i}
          onClick={() => {
            setTo(a.code);
            setToSuggestions([]);
          }}
          className="px-4 py-2 hover:bg-[#3F6592] hover:text-white transition-all duration-200 cursor-pointer flex items-center gap-3"
        >
          <img
            src={`https://flagcdn.com/32x24/${a.countryCode.toLowerCase()}.png`}
            alt={a.countryCode}
            className="w-6 h-4 object-contain rounded-sm shadow-sm border"
          />
          <div className="text-sm">
            <div className="font-semibold">{a.name}</div>
            <div className="text-xs text-gray-500">({a.code})</div>
          </div>
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
          {loading && (
  <div className="flex justify-center items-center my-10">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#3F6592] border-opacity-75"></div>
    <span className="ml-3 text-[#3F6592] font-medium">Chargement des vols...</span>
  </div>
)}
          {/* Formulaire Marchandise */}
<div className="bg-gray-100 rounded-2xl p-6 mt-10 mb-10 shadow-md">
  <h3 className="text-lg font-bold text-[#3F6592] mb-4">📦 Détails de la Marchandise</h3>

  <div className="grid md:grid-cols-2 gap-4">
    <div>
      <label className="block mb-1 font-semibold">Nombre de pièces</label>
      <input
        type="number"
        value={cargoData.pieces}
        onChange={(e) => setCargoData({ ...cargoData, pieces: parseInt(e.target.value), dimensions: Array.from({ length: parseInt(e.target.value) }, () => ({ longueur: "", largeur: "", hauteur: "" })) })}
        className="w-full p-2 border rounded-lg"
        min="1"
      />
    </div>

    <div>
      <label className="block mb-1 font-semibold">Poids (kg)</label>
      <input
        type="number"
        value={cargoData.poids}
        onChange={(e) => setCargoData({ ...cargoData, poids: e.target.value })}
        className="w-full p-2 border rounded-lg"
      />
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          checked={cargoData.poidsParPiece}
          onChange={(e) => setCargoData({ ...cargoData, poidsParPiece: e.target.checked })}
        />
        <label>Poids par pièce</label>
      </div>
    </div>
  </div>

  {/* Dimensions */}
  <div className="mt-4 space-y-2">
    {cargoData.dimensions.map((dim, idx) => (
      <div key={idx} className="grid grid-cols-3 gap-3">
        <input
          type="number"
          placeholder="Longueur (cm)"
          value={dim.longueur}
          onChange={(e) => {
            const updated = [...cargoData.dimensions];
            updated[idx].longueur = e.target.value;
            setCargoData({ ...cargoData, dimensions: updated });
          }}
          className="p-2 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Largeur (cm)"
          value={dim.largeur}
          onChange={(e) => {
            const updated = [...cargoData.dimensions];
            updated[idx].largeur = e.target.value;
            setCargoData({ ...cargoData, dimensions: updated });
          }}
          className="p-2 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Hauteur (cm)"
          value={dim.hauteur}
          onChange={(e) => {
            const updated = [...cargoData.dimensions];
            updated[idx].hauteur = e.target.value;
            setCargoData({ ...cargoData, dimensions: updated });
          }}
          className="p-2 border rounded-lg"
        />
      </div>
    ))}
  </div>

  {/* Autres options */}
  <div className="mt-6 grid md:grid-cols-2 gap-4">
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={cargoData.stackable}
        onChange={(e) => setCargoData({ ...cargoData, stackable: e.target.checked })}
      />
      <label>Empilable (Stackable)</label>
    </div>

    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={cargoData.turnable}
        onChange={(e) => setCargoData({ ...cargoData, turnable: e.target.checked })}
      />
      <label>Retournable (Turnable)</label>
    </div>

    <div>
      <label className="block mb-1 font-semibold">Exigence de température</label>
      <select
        value={cargoData.temperature}
        onChange={(e) => setCargoData({ ...cargoData, temperature: e.target.value })}
        className="w-full p-2 border rounded-lg"
      >
        <option>Non requis</option>
        <option>-10°C à -20°C</option>
        <option>2°C à 8°C</option>
        <option>2°C à 25°C</option>
        <option>15°C à 25°C</option>
      </select>
    </div>

    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={cargoData.suiviTemperature}
        onChange={(e) => setCargoData({ ...cargoData, suiviTemperature: e.target.checked })}
      />
      <label>Suivi température</label>
    </div>

    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={cargoData.conteneurActif}
        onChange={(e) => setCargoData({ ...cargoData, conteneurActif: e.target.checked })}
      />
      <label>Conteneur actif</label>
    </div>

    <div>
      <label className="block mb-1 font-semibold">Type Marchandise</label>
      <select
        value={cargoData.typeMarchandise}
        onChange={(e) => setCargoData({ ...cargoData, typeMarchandise: e.target.value })}
        className="w-full p-2 border rounded-lg"
      >
        <option>Normale</option>
        <option>Marchandise dangereuse</option>
      </select>
    </div>

    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={cargoData.lithiumBattery}
        onChange={(e) => setCargoData({ ...cargoData, lithiumBattery: e.target.checked })}
      />
      <label>Contient batterie lithium</label>
    </div>

    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={cargoData.screened}
          onChange={(e) => setCargoData({ ...cargoData, screened: e.target.checked })}
        />
        <label>Screened</label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={cargoData.diplomatique}
          onChange={(e) => setCargoData({ ...cargoData, diplomatique: e.target.checked })}
        />
        <label>Diplomatique</label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={cargoData.express}
          onChange={(e) => setCargoData({ ...cargoData, express: e.target.checked })}
        />
        <label>Express</label>
      </div>
    </div>
  </div>
</div>


          <div className="flex justify-center">
          <button
  onClick={handleSearch}
  disabled={!from || !to || !date}
  className={`bg-[#0EC953] hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full ${
    !from || !to || !date ? "opacity-50 cursor-not-allowed" : ""
  }`}
>
  Rechercher
</button>

          </div>
       

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
                    <div
  className="flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition"
  onClick={() =>
    setSelectedFlight({
      airline,
      flightNumber: flight.flightNumber,
      from,
      to,
      tarif: freightRatesPerKg[airline],
      segments: flight.segments,
      cargoData, 
      userId: user?._id, 
      totalWeight: cargoData.poidsParPiece
      ? cargoData.pieces * parseFloat(cargoData.poids)
      : parseFloat(cargoData.poids),
            cargoData: cargoData           
    })
  }
  
  >
                      <span className="font-semibold text-black text-sm mb-1">
  {freightRatesPerKg[airline]
    ? `${freightRatesPerKg[airline].toFixed(2)} €/kg`
    : "N/A"}
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
    <FlightDetailsModal flight={selectedFlight} onClose={() => setSelectedFlight(null)} />

  </div>
)}


        </div>



      </main>
    </div>
  );
}
