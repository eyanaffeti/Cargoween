"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar-airline";
import {
  FaUser, FaChevronDown, FaEdit, FaSignOutAlt,
  FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt,
  FaHashtag, FaMoneyBillWave
} from "react-icons/fa";

export default function PublierOffre() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
const [offres, setOffres] = useState([]);
      const [messageType, setMessageType] = useState(""); // ✅ success | error

  const [formData, setFormData] = useState({
    departureAirport: "",
    arrivalAirport: "",
    departureDate: "",
    arrivalDate: "",
    flightNumber: "",
    pricePerKg: ""
  });

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

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

 useEffect(() => {
  const fetchUserAndOffres = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const resUser = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userData = await resUser.json();
    setUser(userData);

    if (resUser.ok) {
      const res = await fetch(`/api/offres?airline=${userData._id}`);
      const data = await res.json();

      // ✅ Ici on génère les tags dynamiquement en fonction des tarifs
    if (Array.isArray(data) && data.length > 0) {
  const minPrice = Math.min(...data.map(o => o.tarifKg));

  const offresAvecTags = data.map(o => {
    const tags = [];

    // 👉 1 seule offre marquée Cheap (le prix minimum exact)
    if (o.tarifKg === minPrice) tags.push("Cheap");

    // 👉 Best = offres avec un prix ≤ 10% plus cher que le minimum
    if (o.tarifKg <= minPrice * 1.1) tags.push("Best");

    // 👉 Green = 1 offre sur 3 seulement (pour varier visuellement)
    if (Math.random() > 0.66) tags.push("Green");

    return { ...o, tags };
  });

  setOffres(offresAvecTags);
}

    }
  };
  fetchUserAndOffres();
}, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateTags = (price) => {
    const tags = [];
    if (price <= 200) tags.push("Cheap");
    if (price <= 300) tags.push("Best");
    if (Math.random() > 0.6) tags.push("Green");
    return tags;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");

  try {
    const body = {
      airline: user?._id,                          // ✅ ID de la compagnie connectée
      from: formData.departureAirport,             // ✅ correspond au champ "from"
      to: formData.arrivalAirport,                 // ✅ correspond au champ "to"
      departureDate: formData.departureDate,
      arrivalDate: formData.arrivalDate,
      flightNumber: formData.flightNumber,
      tarifKg: parseFloat(formData.pricePerKg),    // ✅ correspond à "tarifKg"
      iataAirportCode: formData.departureAirport,  // ✅ tu peux mettre celui du départ (ou créer deux champs si besoin)
      airlineName: user?.company || "Compagnie",   // ✅ nom de la compagnie (depuis user connecté)
    };

    const res = await fetch("/api/offres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Offre publiée avec succès !");
                        setMessageType("success"); // ✅ vert

      setTimeout(() => router.push("/Airline/offre/Liste"), 2000);
    } else {
      setMessage(data.message || "❌ Erreur lors de la publication.");
                          setMessageType("error"); // ✅ rouge

    }
  } catch (err) {
    console.error(err);
    setMessage("❌ Erreur serveur.");
                        setMessageType("error"); // ✅ rouge

  }
};


  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <br></br>
        <div className="bg-white rounded-3xl p-20 shadow-lg relative">
<br></br> <br></br>
          {/* Dropdown profil */}
          <div className="absolute top-5 right-7">
           <br></br> <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center bg-[#3F6592] text-white py-2 px-6 rounded-full shadow-md">
              <FaUser className="mr-2" />
              <span>{user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}</span>
              <FaChevronDown className="ml-2" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md z-10">
                <button onClick={() => router.push("/Airline/Profil")} className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center">
                  <FaEdit className="mr-2" /> Modifier profil
                </button>
                <button onClick={() => {
                  localStorage.removeItem("token");
                  router.push("/");
                }} className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-red-500">
                  <FaSignOutAlt className="mr-2" /> Se déconnecter
                </button>
              </div>
            )}
          </div>

          <h2 className="text-2xl font-semibold text-[#3F6592] mb-10 text-center">Publier une offre de fret aérien </h2>
{/* ✅ Message inline coloré */}
        {message && (
          <p
            className={`text-center font-medium mb-4 ${
              messageType === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

            {/* Champ départ */}
            <div className="relative">
              <label className="block mb-1 text-sm font-medium">Aéroport de départ</label>
              <div className="flex items-center border-2 border-[#3F6592] rounded-md p-2">
                <FaPlaneDeparture className="mr-2 text-gray-600" />
                <input
                  type="text"
                  name="departureAirport"
                  value={formData.departureAirport}
                  onChange={(e) => {
                    handleChange(e);
                    setFromSuggestions(
                      airports.filter(a =>
                        a.code.toLowerCase().includes(e.target.value.toLowerCase()) ||
                        a.name.toLowerCase().includes(e.target.value.toLowerCase())
                      )
                    );
                  }}
                  className="w-full outline-none"
                            placeholder="Ex: TUN"

                  required
                />
              </div>
              {fromSuggestions.length > 0 && (
                <ul className="absolute z-50 bg-white border rounded-lg mt-1 w-full shadow-lg max-h-48 overflow-y-auto">
                  {fromSuggestions.map((a, i) => (
                    <li key={i} onClick={() => {
                      setFormData({ ...formData, departureAirport: a.code });
                      setFromSuggestions([]);
                    }}
                      className="px-3 py-2 hover:bg-[#3F6592] hover:text-white cursor-pointer flex items-center gap-2">
                      <img src={`https://flagcdn.com/32x24/${a.countryCode.toLowerCase()}.png`} alt={a.countryCode} className="w-6 h-4" />
                      <span>{a.name} ({a.code})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Champ arrivée */}
            <div className="relative">
              <label className="block mb-1 text-sm font-medium">Aéroport d’arrivée</label>
              <div className="flex items-center border-2 border-[#3F6592] rounded-md p-2">
                <FaPlaneArrival className="mr-2 text-gray-600" />
                <input
                  type="text"
                  name="arrivalAirport"
                  value={formData.arrivalAirport}
                  onChange={(e) => {
                    handleChange(e);
                    setToSuggestions(
                      airports.filter(a =>
                        a.code.toLowerCase().includes(e.target.value.toLowerCase()) ||
                        a.name.toLowerCase().includes(e.target.value.toLowerCase())
                      )
                    );
                  }}
                  className="w-full outline-none"
                            placeholder="Ex: CDG"

                  required
                />
              </div>
              {toSuggestions.length > 0 && (
                <ul className="absolute z-50 bg-white border rounded-lg mt-1 w-full shadow-lg max-h-48 overflow-y-auto">
                  {toSuggestions.map((a, i) => (
                    <li key={i} onClick={() => {
                      setFormData({ ...formData, arrivalAirport: a.code });
                      setToSuggestions([]);
                    }}
                      className="px-3 py-2 hover:bg-[#3F6592] hover:text-white cursor-pointer flex items-center gap-2">
                      <img src={`https://flagcdn.com/32x24/${a.countryCode.toLowerCase()}.png`} alt={a.countryCode} className="w-6 h-4" />
                      <span>{a.name} ({a.code})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Dates */}
        <div>
  <label className="block mb-1 text-sm font-medium">Date et heure de départ</label>
  <div className="flex items-center border-2 border-[#3F6592] rounded-md p-2">
    <FaCalendarAlt className="mr-2 text-gray-600" />
    <input
      type="datetime-local"
      name="departureDate"
      value={formData.departureDate}
      onChange={handleChange}
      className="w-full outline-none"
      required
    />
  </div>
</div>

<div>
  <label className="block mb-1 text-sm font-medium">Date et heure d’arrivée</label>
  <div className="flex items-center border-2 border-[#3F6592] rounded-md p-2">
    <FaCalendarAlt className="mr-2 text-gray-600" />
    <input
      type="datetime-local"
      name="arrivalDate"
      value={formData.arrivalDate}
      onChange={handleChange}
      className="w-full outline-none"
      required
    />
  </div>
</div>


            {/* Flight number */}
            <div>
              <label className="block mb-1 text-sm font-medium">Numéro de vol</label>
              <div className="flex items-center border-2 border-[#3F6592] rounded-md p-2">
                <FaHashtag className="mr-2 text-gray-600" />
                <input type="text" name="flightNumber" value={formData.flightNumber} onChange={handleChange} className="w-full outline-none"          placeholder="Ex: TU123"
 required />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block mb-1 text-sm font-medium">Prix par kg (TND)</label>
              <div className="flex items-center border-2 border-[#3F6592] rounded-md p-2">
                <FaMoneyBillWave className="mr-2 text-gray-600" />
                <input type="number" name="pricePerKg" value={formData.pricePerKg} onChange={handleChange} className="w-full outline-none"            placeholder="Ex: 1.5/ kg"
 required />
              </div>
            </div>
<br></br>
            <div className="col-span-2 flex justify-center mt-4">
              <button type="submit" className="bg-[#0EC953] hover:bg-green-600 text-white py-3 px-12 rounded-full shadow-md">
                Publier l’offre
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
