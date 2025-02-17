"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import Navbarlight from "@/components/Navbarlight";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Connexion réussie !");
        localStorage.setItem("token", data.token); // Stockage local
        document.cookie = `token=${data.token}; path=/; Secure; SameSite=Strict`; // 🔹 Stocker dans un cookie
      
        console.log("✅ Redirection en cours...");
        setTimeout(() => {
          window.location.replace("/dashboard");
        }, 2000);
      }
      else {
        setMessage(data.message || "Erreur lors de la connexion");
      }
    } catch (error) {
      setMessage("Erreur serveur");
    }
  };

  return (
    <div>
      <Navbarlight />

      <div className="relative min-h-screen bg-[#F8F8F8] flex flex-col justify-center items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: "url('/world-map.png')" }} 
        ></div>

        <div className="relative bg-[#121B2D] text-white p-8 rounded-xl shadow-lg w-[400px] md:w-[450px] lg:w-[500px]">
          <h2 className="text-center text-2xl font-semibold mb-6">Connexion</h2>

          {message && <p className="text-center text-red-500">{message}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                className="w-full p-3 rounded-full bg-gray-200 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0089B6]"
                required
              />
            </div>

            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Mot de Passe"
                onChange={handleChange}
                className="w-full p-3 rounded-full bg-gray-200 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0089B6]"
                required
              />
            </div>

            <div className="text-right text-sm">
              <a href="#" className="text-[#0089B6] hover:underline">
                Mot de Passe Oublié ?
              </a>
            </div>

            <button type="submit" className="w-full bg-[#0089B6] hover:bg-[#0078A4] text-white py-3 rounded-full font-medium transition-all">
              Connexion
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Vous n'avez pas un compte ?{" "}
            <a href="/signin" className="text-[#0089B6] hover:underline">
              Inscrivez-vous
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
