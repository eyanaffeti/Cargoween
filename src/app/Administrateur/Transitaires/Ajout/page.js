"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  FaCog, FaEnvelope, FaUser, FaPhone, FaMapMarkerAlt,
  FaBriefcase, FaBuilding, FaIdBadge, FaLock, FaGlobe,
  FaCity, FaHome, FaBarcode
} from "react-icons/fa";

export default function AddTransitaire() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    firstname: "", lastname: "", email: "", company: "", country: "",
    city: "", address: "", postalCode: "", companyID: "", function: "",
    phone: "", cassNumber: "", password: "", confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (formData.password !== formData.confirmPassword) return setMessage("❌ Les mots de passe ne correspondent pas !");
    
    // Crée un transitaire avec le rôle "transitaire"
    const payload = {
      ...formData,
      isSecondary: false,  // Le transitaire ajouté est principal, pas secondaire
    };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Transitaire ajouté avec succès !");
        setTimeout(() => router.push("/Administrateur/Transitaires/Liste"), 2000);
      } else {
        setMessage(data.message || " Erreur lors de l'ajout");
      }
    } catch {
      setMessage(" Erreur serveur");
    }
  };

  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-white rounded-3xl p-32 shadow-lg relative">
          {/* User display */}
          <button className="absolute top-5 right-7 flex items-center bg-[#3F6592] text-white py-2 px-6 rounded-full shadow-md">
            <FaUser className="mr-2" />
            <span>{user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}</span>
          </button>

          <h2 className="text-2xl font-semibold text-[#3F6592] mb-10 text-center">
            Ajouter un Transitaire
          </h2>

          {message && <p className="text-center text-red-500 mb-4">{message}</p>}

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            <InputField icon={<FaUser />} name="firstname" placeholder="Prénom" handleChange={handleChange} />
            <InputField icon={<FaUser />} name="lastname" placeholder="Nom" handleChange={handleChange} />
            <InputField icon={<FaEnvelope />} name="email" placeholder="Email" handleChange={handleChange} />
            <InputField icon={<FaBuilding />} name="company" placeholder="Entreprise" handleChange={handleChange} />
            <InputField icon={<FaGlobe />} name="country" placeholder="Pays" handleChange={handleChange} />
            <InputField icon={<FaCity />} name="city" placeholder="Ville" handleChange={handleChange} />
            <InputField icon={<FaHome />} name="address" placeholder="Adresse" handleChange={handleChange} />
            <InputField icon={<FaBarcode />} name="postalCode" placeholder="Code Postal" handleChange={handleChange} />
            <InputField icon={<FaBuilding />} name="companyID" placeholder="ID Compagnie" handleChange={handleChange} />
            <InputField icon={<FaBriefcase />} name="function" placeholder="Fonction" handleChange={handleChange} />
            <InputField icon={<FaPhone />} name="phone" placeholder="Téléphone" handleChange={handleChange} />
            <InputField icon={<FaIdBadge />} name="cassNumber" placeholder="Num CASS IATA" handleChange={handleChange} />
            <InputField icon={<FaLock />} type="password" name="password" placeholder="Mot de passe" handleChange={handleChange} />
            <InputField icon={<FaLock />} type="password" name="confirmPassword" placeholder="Confirmer le mot de passe" handleChange={handleChange} />

            <div className="col-span-2 flex justify-center mt-4">
              <button type="submit" className="bg-[#0EC953] text-white px-8 py-3 rounded-full font-medium hover:bg-green-600 transition-all">
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function InputField({ icon, name, placeholder, handleChange, type = "text" }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        onChange={handleChange}
        className="w-full p-3 pl-10 border-2 border-[#3F6592] rounded-lg"
        required
      />
    </div>
  );
}
