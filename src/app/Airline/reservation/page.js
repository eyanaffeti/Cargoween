"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar-airline";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaClock,
  FaCheckCircle,
  FaChevronDown,
  FaEdit,
  FaSignOutAlt,
  FaTrash,
  FaPlane,
  FaSearch,
} from "react-icons/fa";

export default function ReservationsPage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // ✅ nombre de lignes par page
  const router = useRouter();

  // ✅ Récupération des réservations
  const fetchReservations = async (userId, role, airlineCode) => {
    try {
      const res = await fetch(
        `/api/reservation?userId=${userId}&role=${role}&airlineCode=${airlineCode}`
      );
      const data = await res.json();
      if (res.ok) setReservations(data);
    } catch (err) {
      console.error("❌ Erreur fetchReservations compagnie:", err);
    }
  };

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
        fetchReservations(data._id, data.role, data.airlineCode);
      }
    };
    fetchUser();
  }, []);

  // ✅ Suppression d'une réservation
  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cette réservation ?")) return;

    try {
      const res = await fetch(`/api/reservation/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        setReservations((prev) => prev.filter((r) => r._id !== id));
      } else {
        console.error("❌ Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("❌ Erreur réseau:", err);
    }
  };

  // ✅ Filtrage par recherche
  const filteredReservations = reservations.filter((res) => {
    const searchLower = search.toLowerCase();
    return (
      res.from?.toLowerCase().includes(searchLower) ||
      res.to?.toLowerCase().includes(searchLower) ||
      res.user?.email?.toLowerCase().includes(searchLower) ||
      res.user?.phone?.toLowerCase().includes(searchLower) ||
      res.flightNumber?.toLowerCase().includes(searchLower)
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
        className={`transition-all duration-300 flex-1 min-h-screen bg-[#f4f7fb] flex flex-col items-center justify-start p-8 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <div className="bg-white rounded-3xl p-10 shadow-lg w-full max-w-7xl relative">
          {/* Dropdown profil */}
          <div className="absolute top-5 right-7">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center bg-[#3F6592] text-white py-2 px-6 rounded-full shadow-md hover:bg-[#2c4e75] transition"
            >
              <FaUser className="mr-2" />
              <span>
                {user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}
              </span>
              <FaChevronDown className="ml-2" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md z-10">
                <button
                  onClick={() => router.push("/Airline/Profil")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                >
                  <FaEdit className="mr-2" /> Modifier profil
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    router.push("/");
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-red-500"
                >
                  <FaSignOutAlt className="mr-2" /> Se déconnecter
                </button>
              </div>
            )}
          </div>

          <h2 className="text-3xl font-bold text-center text-[#3F6592] mb-6">
            📦 Réservations sur mes Offres publiées
          </h2>

          {/* ✅ Barre de recherche */}
          <div className="flex items-center mb-6">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Rechercher par vol, départ, client..."
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
              <thead className="bg-[#3F6592] text-white">
                <tr>
                  <th className="py-3 px-4">Départ</th>
                  <th className="py-3 px-4">Arrivée</th>
                  <th className="py-3 px-4">N° Vol</th>
                  <th className="py-3 px-4">Téléphone transitaire</th>
                  <th className="py-3 px-4">Email transitaire</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Détails</th>
                  <th className="py-3 px-4">❌ Supprimer</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReservations.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-6 text-gray-500">
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
                      <td className="py-3 px-4">{res.from || "N/A"}</td>
                      <td className="py-3 px-4">{res.to || "N/A"}</td>
                      <td className="py-3 px-4">{res.flightNumber || "—"}</td>
                      <td className="py-3 px-4">{res.user?.phone || "—"}</td>
                      <td className="py-3 px-4">{res.user?.email || "—"}</td>
                      <td className="py-3 px-4">
                        {new Date(res.departureDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={res.etat || "En attente"}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              const response = await fetch(
                                `/api/reservation/${res._id}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                  },
                                  body: JSON.stringify({ etat: newStatus }),
                                }
                              );

                              if (response.ok) {
                                setReservations((prev) =>
                                  prev.map((r) =>
                                    r._id === res._id
                                      ? { ...r, etat: newStatus }
                                      : r
                                  )
                                );
                              }
                            } catch (err) {
                              console.error("❌ Erreur réseau:", err);
                            }
                          }}
                          className="border rounded px-2 py-1 bg-white text-sm focus:ring-2 focus:ring-[#3F6592]"
                        >
                          <option value="En attente">⏳ En attente</option>
                          <option value="Confirmée">✅ Acceptée</option>
                          <option value="Annulée">❌ Annulée</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            router.push(`/Airline/reservation/${res._id}`)
                          }
                          className="text-xs text-white bg-[#3F6592] hover:bg-[#2c4e75] px-4 py-2 rounded-full transition"
                        >
                          Voir détails
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDelete(res._id)}
                          className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-full shadow transition flex items-center justify-center"
                        >
                          <FaTrash className="mr-1" /> Supprimer
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
              Page {currentPage} sur {totalPages}
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
