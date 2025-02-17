"use client";

import { useState } from "react";
import Navbarlight from "@/components/Navbarlight";
import Footer from "@/components/Footer";
import { FaUser, FaBuilding, FaMapMarkerAlt, FaPhone, FaLock, FaGlobe } from "react-icons/fa";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    company: "",
    country: "",
    city: "",
    address: "",
    postalCode: "",
    companyID: "",
    function: "",
    phone: "",
    cassNumber: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Réinitialiser le message

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Inscription réussie ! Redirection...");
        setTimeout(() => {
          window.location.href = "/login"; // Rediriger après succès
        }, 2000);
      } else {
        setMessage(data.message || "Erreur lors de l'inscription");
      }
    } catch (error) {
      setMessage("Erreur serveur");
    }
  };

  return (
    <>
      <Navbarlight />

      {/* Section avec l'image de fond */}
      <section
        className="flex flex-col items-center min-h-screen bg-cover bg-center pt-32"
        style={{
          backgroundImage: "url('/world-map.png')",
        }}
      >
        {/* Formulaire opaque */}
        <div className="bg-[#121B2D] text-white rounded-2xl p-10 shadow-lg w-[716px] mt-12">
          <h2 className="text-center text-3xl font-semibold mb-6">Transitaires</h2>

          {message && <p className="text-center text-red-500">{message}</p>}

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {/* Champs de formulaire avec icônes */}
            {[
              { name: "email", placeholder: "Email", icon: <FaUser /> },
              { name: "firstname", placeholder: "Prénom", icon: <FaUser /> },
              { name: "lastname", placeholder: "Nom", icon: <FaUser /> },
              { name: "company", placeholder: "Nom de la compagnie", icon: <FaBuilding /> },
              { name: "country", placeholder: "Pays", icon: <FaGlobe /> },
              { name: "city", placeholder: "Ville", icon: <FaMapMarkerAlt /> },
              { name: "address", placeholder: "Adresse", icon: <FaMapMarkerAlt /> },
              { name: "postalCode", placeholder: "Code Postal", icon: <FaLock /> },
              { name: "companyID", placeholder: "ID de votre compagnie", icon: <FaLock /> },
              { name: "function", placeholder: "Fonction", icon: <FaBuilding /> },
              { name: "cassNumber", placeholder: "IATA CASS Num", icon: <FaLock /> },
            ].map((field, index) => (
              <div key={index} className="relative w-full">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{field.icon}</span>
                <input
                  type="text"
                  name={field.name}
                  placeholder={field.placeholder}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-3 rounded-full bg-gray-200 text-black w-full outline-none focus:ring-2 focus:ring-[#0089B6]"
                  required
                />
              </div>
            ))}

            {/* Numéro de téléphone */}
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">+216</span>
              <input
                type="text"
                name="phone"
                placeholder="Numéro de téléphone"
                onChange={handleChange}
                className="pl-16 pr-4 py-3 rounded-full bg-gray-200 text-black w-full outline-none focus:ring-2 focus:ring-[#0089B6]"
                required
              />
            </div>

            {/* Champ Mot de Passe */}
            <div className="col-span-2 flex justify-center">
              <div className="relative w-2/3">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaLock />
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  onChange={handleChange}
                  className="pl-10 pr-4 py-3 rounded-full bg-gray-200 text-black w-full outline-none focus:ring-2 focus:ring-[#0089B6]"
                  required
                />
              </div>
            </div>

            {/* Bouton d'inscription */}
            <div className="col-span-2 flex justify-center">
              <button
                type="submit"
                className="bg-[#0089B6] hover:bg-[#0075A0] text-white font-medium py-2 px-6 rounded-full transition-all text-sm"
              >
                Je m'inscris
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}
