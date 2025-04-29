"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { FaUser } from "react-icons/fa";
export default function ReservationDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reservation, setReservation] = useState(null);
  const [awb, setAwb] = useState("");
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUser(data);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchReservation() {
      const res = await fetch(`/api/reservation/${id}`);
      const data = await res.json();
      if (res.ok) {
        setReservation(data);
        setAwb(data.awb || ""); 
      }
  
    }
    if (id) fetchReservation();
  }, [id]);

  const handleSaveAwb = async () => {
    try {
      const res = await fetch(`/api/reservation/${id}/awb`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awb }),
      });
      const updated = await res.json();
      if (res.ok) {
        setReservation(updated); // mettre à jour localement
        alert("✅ AWB mis à jour !");
      } else {
        alert("❌ Erreur : " + (updated.message || "échec de la mise à jour"));
      }
    } catch {
      alert("❌ Erreur en enregistrant l'AWB");
    }
  };
  

  if (!reservation) {
    return <div className="p-10 text-center">Chargement...</div>;
  }

  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-white rounded-3xl p-10 shadow-lg relative">
          {/* User Top Right */}
          <div className="absolute top-10 right-10">
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

          <h2 className="text-3xl font-bold text-center text-[#3F6592] mb-10">📦 Détails de la réservation</h2>

          {/* Bloc 1 : Vol */}
          <div className="bg-white rounded-lg shadow p-6 mb-10 border border-gray-200">
            <h3 className="text-lg font-bold text-[#3F6592] mb-4">✈️ Détails du vol</h3>
            <p><strong>Compagnie:</strong> {reservation.airline}</p>
            <p><strong>Vol:</strong> {reservation.flightNumber}</p>
            <p><strong>Départ:</strong> {new Date(reservation.departureDate).toLocaleString()}</p>
            <p><strong>Arrivée:</strong> {new Date(reservation.arrivalDate).toLocaleString()}</p>
          </div>

          {/* Bloc 2 : Marchandise */}
          <div className="bg-white rounded-lg shadow p-6 mb-10 border border-gray-200">
            <h3 className="text-lg font-bold text-[#3F6592] mb-4">📦 Détails de la marchandise</h3>
            <p><strong>Nombre de pièces:</strong> {reservation.marchandise.pieces}</p>
            <p><strong>Poids Total:</strong> {reservation.totalWeight} kg</p>
          </div>

          {/* Bloc 3 : Tarifs */}
          <div className="bg-white rounded-lg shadow p-6 mb-10 border border-gray-200">
            <h3 className="text-lg font-bold text-[#3F6592] mb-4">💶 Tarification</h3>
            <p><strong>Coût Fret:</strong> {reservation.tarif.toFixed(2)} €/kg</p>
            <p><strong>Prix Total:</strong> {reservation.totalPrice.toFixed(2)} €</p>
          </div>

          {/* Bloc 4 : AWB */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-[#3F6592] mb-4">📄 Numéro AWB</h3>
            <input
              type="text"
              placeholder="Entrez votre numéro AWB"
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              className="w-full p-3 border rounded mb-4"
            />
            <button
              onClick={handleSaveAwb}
              className="bg-[#0EC953] hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full"
            >
              Valider AWB
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
