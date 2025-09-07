"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar-airline";
import {
  FaEnvelope, FaUser, FaPhone, FaMapMarkerAlt,
  FaBriefcase, FaBuilding, FaIdBadge, FaLock, FaGlobe,
  FaCity, FaHome, FaBarcode, FaPlane,FaChevronDown,FaEdit,FaSignOutAlt 
} from "react-icons/fa";

export default function UpdateAirline() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    firstname: "", lastname: "", email: "", company: "", country: "",
    city: "", address: "", postalCode: "", companyID: "", function: "",
    phone: "", iataAirportCode: "", airlineCode: "", iataCode: "",
    password: "", confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 👉 Récupération des infos de l’utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setFormData({
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          email: data.email || "",
          company: data.company || "",
          country: data.country || "",
          city: data.city || "",
          address: data.address || "",
          postalCode: data.postalCode || "",
          companyID: data.companyID || "",
          function: data.function || "",
          phone: data.phone || "",
          iataAirportCode: data.iataAirportCode || "",
          airlineCode: data.airlineCode || "",
          iataCode: data.iataCode || "",
          password: "",
          confirmPassword: "",
        });
      }
    };
    fetchUser();

    const handleClickOutside = (e) => {
      if (!e.target.closest(".user-menu")) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 👉 Soumission formulaire Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setMessage("❌ Les mots de passe ne correspondent pas !");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/Airline/profil-update", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Profil mis à jour avec succès !");
setTimeout(() => {
          window.location.reload(); // ou router.refresh() si applicable
        }, 800);      } else {
        setMessage(data.message || "Erreur lors de la mise à jour");
      }
    } catch {
      setMessage("Erreur serveur");
    }
  };

  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-white rounded-3xl p-32 shadow-lg relative">
          {/* Menu utilisateur */}
           <div className="absolute top-5 right-7">
                     <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center bg-[#3F6592] text-white py-2 px-6 rounded-full shadow-md">
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

          <h2 className="text-2xl font-semibold text-[#3F6592] mb-10 text-center">Modifier Votre Profil</h2>

          {message && <p className="text-center text-red-500 mb-4">{message}</p>}

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            <InputField icon={<FaUser />} name="firstname" value={formData.firstname} placeholder="Prénom" handleChange={handleChange} />
            <InputField icon={<FaUser />} name="lastname" value={formData.lastname} placeholder="Nom" handleChange={handleChange} />
            <InputField icon={<FaEnvelope />} name="email" value={formData.email} placeholder="Email" handleChange={handleChange} />
            <InputField icon={<FaBuilding />} name="company" value={formData.company} placeholder="Nom de la compagnie" handleChange={handleChange} />
            <InputField icon={<FaGlobe />} name="country" value={formData.country} placeholder="Pays" handleChange={handleChange} />
            <InputField icon={<FaCity />} name="city" value={formData.city} placeholder="Ville" handleChange={handleChange} />
            <InputField icon={<FaHome />} name="address" value={formData.address} placeholder="Adresse" handleChange={handleChange} />
            <InputField icon={<FaBarcode />} name="postalCode" value={formData.postalCode} placeholder="Code Postal" handleChange={handleChange} />
            <InputField icon={<FaIdBadge />} name="companyID" value={formData.companyID} placeholder="ID Compagnie" handleChange={handleChange} />
            <InputField icon={<FaBriefcase />} name="function" value={formData.function} placeholder="Fonction" handleChange={handleChange} />
            <InputField icon={<FaPlane />} name="iataAirportCode" value={formData.iataAirportCode} placeholder="Code IATA de l'aéroport" handleChange={handleChange} />
            <InputField icon={<FaPlane />} name="airlineCode" value={formData.airlineCode} placeholder="Code Compagnie aérienne" handleChange={handleChange} />
            <InputField icon={<FaPlane />} name="iataCode" value={formData.iataCode} placeholder="Code IATA" handleChange={handleChange} />
            <InputField icon={<FaPhone />} name="phone" value={formData.phone} placeholder="Téléphone" handleChange={handleChange} />

            {/* Mot de passe optionnel */}
            <InputField
              icon={<FaLock />}
              type="password"
              name="password"
              placeholder="Nouveau mot de passe"
              value={formData.password}
              handleChange={handleChange}
            />
            
            <InputField
              icon={<FaLock />}
              type="password"
              name="confirmPassword"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              handleChange={handleChange}
            />

            <div className="col-span-2 flex justify-center mt-4">
              <button type="submit" className="bg-[#0EC953] text-white px-8 py-3 rounded-full font-medium hover:bg-green-600 transition-all">
                Mettre à jour
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// Champ Input réutilisable
function InputField({ icon, name, placeholder, handleChange, value = "", type = "text" }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="w-full p-3 pl-10 border-2 border-[#3F6592] rounded-lg outline-none focus:ring-2 focus:ring-[#0089B6]"
      />
    </div>
  );
}
