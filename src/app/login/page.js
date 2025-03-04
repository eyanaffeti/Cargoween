"use client";

import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Navbarlight from "@/components/Navbarlight";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  // ✅ Vérifier si l'utilisateur est déjà connecté avec un token valide
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("🔍 Payload récupéré :", payload);

        if (payload.isVerified) {
          console.log("✅ Utilisateur déjà vérifié, redirection immédiate !");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("❌ Erreur de décodage du token :", error);
      }
    }
  }, []);

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
      console.log("📩 Réponse reçue :", data);

      if (response.ok) {
        // ✅ Vérifier si l'utilisateur est déjà vérifié
        if (data.isVerified) {
          console.log("✅ L'utilisateur est déjà vérifié, redirection vers dashboard !");
          
          // ✅ Stocker le token avant de rediriger
          localStorage.setItem("token", data.token);
          localStorage.setItem("isVerified", "true"); // ✅ Stocke `isVerified`
          document.cookie = `token=${data.token}; path=/; Secure; SameSite=Strict`;

          router.push("/dashboard");
          return;
        }

        // 🔹 Si l'utilisateur n'est pas encore vérifié, on lui demande un code
        console.log("📩 L'utilisateur doit entrer le code de vérification !");
        setMessage("📩 Code de vérification envoyé à votre e-mail !");
        setUserEmail(formData.email);
        setShowVerification(true);
      } else {
        console.log("❌ Erreur de connexion :", data.message);
        setMessage(data.message || "❌ Erreur lors de la connexion");
      }
    } catch (error) {
      console.error("❌ Erreur serveur :", error);
      setMessage("❌ Erreur serveur");
    }
  };

  // ✅ Correction : Déclaration correcte de `handleVerification`
  const handleVerification = async () => {
    setMessage("");

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail, // ✅ Utilisation de l'email enregistré
          verificationCode: verificationCode,
        }),
      });

      const data = await response.json();
      console.log("✅ Token reçu après vérification :", data.token);

      if (response.ok) {
        setMessage("✅ Vérification réussie ! Redirection...");

        // 🔹 Supprimer l'ancien token avant d’enregistrer le nouveau
        localStorage.removeItem("token");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // 🔹 Stocker le nouveau token
        localStorage.setItem("token", data.token);
        document.cookie = `token=${data.token}; path=/; Secure; SameSite=Strict`;

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setMessage("❌ Code incorrect !");
      }
    } catch (error) {
      setMessage("❌ Erreur serveur");
    }
  };

  return (
    <div>
      <Navbarlight />
      <div className="relative min-h-screen bg-[#F8F8F8] flex flex-col justify-center items-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/world-map.png')" }}></div>
        <div className="relative bg-[#121B2D] text-white p-8 rounded-xl shadow-lg w-[400px] md:w-[450px] lg:w-[500px]">
          <h2 className="text-center text-2xl font-semibold mb-6">Connexion</h2>

          {message && <p className="text-center text-red-500">{message}</p>}

          {!showVerification ? (
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
              <div className="col-span-2 flex justify-center">
                <button
                  type="submit"
                  className="px-9 py-3 text-white border-4 border-[#0089B6] rounded-full text-lg font-medium hover:bg-[#0089B6] transition-all duration-300"
                >
                  Connexion
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-white">Entrez le code reçu par e-mail</p>
              <input
                type="text"
                name="verificationCode"
                placeholder="Code de vérification"
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full p-3 rounded-full bg-gray-200 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0089B6]"
                required
              />
              <div className="col-span-2 flex justify-center">
                <button
                  onClick={handleVerification}
                  className="px-9 py-3 text-white border-4 border-[#0089B6] rounded-full text-lg font-medium hover:bg-[#0089B6] transition-all duration-300"
                >
                  Vérifier le Code
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm mt-4">
            Vous n'avez pas un compte ?{" "}
            <a href="/identifier" className="text-[#0089B6] hover:underline">
              Inscrivez-vous
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
