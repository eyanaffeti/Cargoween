"use client";

import { useState, useEffect } from "react";
import { FaLock, FaEnvelope } from "react-icons/fa";

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
      const [messageType, setMessageType] = useState(""); // ✅ success | error


   // Vérifier si l'utilisateur est déjà connecté avec un token valide
   useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Décoder le token pour obtenir le payload

        if (payload.role === "admin") {
          // Redirection vers le dashboard de l'administrateur sans vérifier "isVerified"
          router.push("/Administrateur");
        } else if (payload.role === "transitaire" || payload.role === "airline") {
          // Si l'utilisateur est un transitaire ou airline, vérifier l'état de vérification
          if (payload.isVerified) {
            // Si l'utilisateur est vérifié, redirection vers le dashboard respectif
            if (payload.role === "transitaire") {
              router.push("/Transitaire");
            } else if (payload.role === "airline") {
              router.push("/Airline");
            }
          } else {
            // Si l'utilisateur n'est pas vérifié, redirection vers la page de vérification
            setShowVerification(true); // Afficher la page de vérification
            setUserEmail(payload.email); // Récupérer l'email pour la vérification
          }
        }
      } catch (error) {
        console.error("Erreur de décodage du token :", error);
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

      if (response.ok) {
        // Vérifier si l'utilisateur est déjà vérifié
        if (data.isVerified || data.role === "admin") {
          console.log("L'utilisateur est déjà vérifié ou est un admin, redirection vers le dashboard !");
          
          // Stocker le token avant de rediriger
          localStorage.setItem("token", data.token);
          localStorage.setItem("isVerified", "true"); //  Stocke `isVerified`
          document.cookie = `token=${data.token}; path=/; Secure; SameSite=Strict`;

          if (data.role === "admin") {
            router.push("/Administrateur");
          } else if (data.role === "transitaire" || data.role === "transitaire-secondaire") {
            router.push("/Transitaire");
          } else if (data.role === "airline") {
            router.push("/Airline");
          }
          return;
        }

        // Si l'utilisateur n'est pas encore vérifié, on lui demande un code
        console.log("L'utilisateur doit entrer le code de vérification !");
        setMessage("📩 Code de vérification envoyé à votre e-mail !");
                        setMessageType("success"); // ✅ vert

        setUserEmail(formData.email);
        setShowVerification(true);
      } else {
        console.log("Erreur de connexion :", data.message);
        setMessage(data.message || "Erreur lors de la connexion");
                      setMessageType("error"); // ✅ rouge

      }
    } catch (error) {
      console.error("Erreur serveur :", error);
      setMessage("Erreur serveur");
                    setMessageType("error"); // ✅ rouge

    }
  };

  const handleVerification = async () => {
    setMessage("");

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail, // Utilisation de l'email enregistré
          verificationCode: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Vérification réussie ! Redirection...");
                        setMessageType("success"); // ✅ vert


        // Supprimer l'ancien token avant d’enregistrer le nouveau
        localStorage.removeItem("token");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Stocker le nouveau token
        localStorage.setItem("token", data.token);
        document.cookie = `token=${data.token}; path=/; Secure; SameSite=Strict`;

        setTimeout(() => {
          if (data.role === "transitaire" || data.role === "transitaire-secondaire") {
            router.push("/Transitaire");
          } else if (data.role === "airline") {
            router.push("/Airline");
          }
        }, 2000);
      } else {
        setMessage("Code incorrect !");
                      setMessageType("error"); // ✅ rouge

      }
    } catch (error) {
      setMessage("Erreur serveur");
                    setMessageType("error"); // ✅ rouge

    }
  };

  return (
    <div>
      <div className="relative min-h-screen bg-[#F8F8F8] flex flex-col justify-center items-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/world-map.png')" }}></div>
        <div className="relative bg-[#121B2D] text-white p-16 rounded-xl shadow-lg w-[400px] md:w-[450px] lg:w-[600px]">
          <h2 className="text-center text-2xl font-semibold mb-11">Connexion</h2>

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
          {!showVerification ? (
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="relative" >
              <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />

                <input
                
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  className="w-full pl-12 p-4 rounded-full bg-gray-200 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0089B6]"
                  required
                />
              </div>
              <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />

                <input
                  type="password"
                  name="password"
                  placeholder="Mot de Passe"
                  onChange={handleChange}
                  className="w-full pl-12 p-4 rounded-full bg-gray-200 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0089B6]"
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
    </div>
  );
}
