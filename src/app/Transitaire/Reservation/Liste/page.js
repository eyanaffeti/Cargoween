"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaCheckCircle,
  FaClock,
  FaPlane,
  FaSearch,
} from "react-icons/fa";

export default function ReservationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // ✅ nombre de lignes par page
  const router = useRouter();

  // ✅ Récupération des réservations du transitaire
  const fetchReservations = async (userId) => {
    try {
      const res = await fetch(`/api/reservation?userId=${userId}&role=transitaire`);
      const data = await res.json();
      if (res.ok) setReservations(data);
    } catch (err) {
      console.error("❌ Erreur fetchReservations:", err);
    }
  };

  // ✅ Récupération utilisateur connecté
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
        fetchReservations(data._id);
      }
    };
    fetchUser();
  }, []);

  // ✅ Couleur selon statut
  const getStatusColor = (etat) => {
    switch (etat) {
      case "Annulée":
        return "bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold";
      case "Confirmée":
      case "Acceptée":
        return "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold";
      case "En attente":
      default:
        return "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold";
    }
  };

  // ✅ Filtrage recherche
  const filteredReservations = reservations.filter((res) => {
    const searchLower = search.toLowerCase();
    return (
      res.from?.toLowerCase().includes(searchLower) ||
      res.to?.toLowerCase().includes(searchLower) ||
      res.flightNumber?.toLowerCase().includes(searchLower) ||
      res.etat?.toLowerCase().includes(searchLower)
    );
  });

  // ✅ Pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main
        className={`transition-all duration-300 flex-1 min-h-screen bg-gradient-to-br from-[#3F6592] to-[#2c4e75] p-8 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <div className="bg-white rounded-3xl p-10 shadow-xl relative">
                  <br></br>
          {/* Menu utilisateur */}
          <div className="absolute top-6 right-8">
            <div className="relative">
              <button
                className="flex items-center bg-[#3F6592] text-white py-2 px-5 rounded-full shadow-md hover:bg-[#2c4e75] transition"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <FaUser className="mr-2" />
                <span className="font-medium">
                  {user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white text-[#3F6592] rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      router.push("/Transitaire/Profil");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Modifier profil
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      document.cookie =
                        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      router.push("/login");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        <br></br>        <br></br>
          <h2 className="text-3xl font-bold text-center text-[#3F6592] mb-6">
            📦 Mes Réservations
          </h2>
        <br></br>
          {/* ✅ Barre de recherche */}
          <div className="flex items-center mb-6">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Rechercher par départ, arrivée, vol..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3F6592] focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto rounded-xl shadow border">
            <table className="min-w-full bg-white text-sm rounded-lg text-center">
              <thead className="bg-[#3F6592] text-white text-sm uppercase">
                <tr>
                  <th className="py-3 px-4">
                    <FaPlaneDeparture className="inline mr-2" />
                    Départ
                  </th>
                  <th className="py-3 px-4">
                    <FaPlaneArrival className="inline mr-2" />
                    Arrivée
                  </th>
                  <th className="py-3 px-4">
                    <FaPlane className="inline mr-2" />
                    N° Vol
                  </th>
                  <th className="py-3 px-4">
                    <FaClock className="inline mr-2" />
                    Date
                  </th>
                  <th className="py-3 px-4">
                    <FaCheckCircle className="inline mr-2" />
                    Statut
                  </th>
                  <th className="py-3 px-4">Détails</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReservations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">
                      Aucune réservation trouvée.
                    </td>
                  </tr>
                ) : (
                  paginatedReservations.map((res, i) => (
                    <tr
                      key={res._id}
                      className={`${
                        i % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100 transition`}
                    >
                      <td className="py-3 px-4 font-medium">{res.from || "N/A"}</td>
                      <td className="py-3 px-4">{res.to || "N/A"}</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {res.flightNumber || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(res.departureDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3 px-4">
                        <span className={getStatusColor(res.etat)}>
                          {res.etat || "En attente"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            router.push(`/Transitaire/Reservation/${res._id}`)
                          }
                          className="text-xs text-white bg-[#3F6592] hover:bg-[#2c4e75] px-4 py-2 rounded-full shadow transition"
                        >
                          Voir détails
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2 bg-[#3F6592] text-white rounded disabled:opacity-50"
            >
              ⬅️ Précédent
            </button>
            <span>
              Page {currentPage} sur {totalPages || 1}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-4 py-2 bg-[#3F6592] text-white rounded disabled:opacity-50"
            >
              Suivant ➡️
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
