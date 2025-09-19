"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebare-admin";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaChevronDown,
  FaEdit,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";
import Toast from "@/components/Toast";

export default function ReservationsAdminPage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // ✅ Récupération des réservations (toutes pour admin)
  const fetchReservations = async (userId, role) => {
    try {
      const res = await fetch(`/api/reservation?userId=${userId}&role=${role}`);
      const data = await res.json();
      if (res.ok) setReservations(data);
    } catch (err) {
      console.error("❌ Erreur fetchReservations admin:", err);
    } finally {
      setLoading(false);
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
        fetchReservations(data._id, data.role);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col justify-center items-center z-50">
        <img src="/preloader.gif" alt="Chargement..." className="w-32 h-32 mb-4" />
        <p className="text-[#3F6592] font-semibold text-lg">
          Chargement des réservations...
        </p>
      </div>
    );
  }

  // ✅ Filtrage
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
          {/* Profil dropdown */}
          <div className="absolute top-5 right-7">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center bg-[#3F6592] text-white py-2 px-6 rounded-full shadow-md hover:bg-[#2c4e75] transition"
            >
              <FaUser className="mr-2" />
              <span>{user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}</span>
              <FaChevronDown className="ml-2" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md z-10">
                <button
                  onClick={() => router.push("/Administrateur/Profil")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                >
                  <FaEdit className="mr-2" /> Modifier profil
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    router.push("/login");
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-red-500"
                >
                  <FaSignOutAlt className="mr-2" /> Se déconnecter
                </button>
              </div>
            )}
          </div>
<br></br> <br></br> <br></br> 
          <h2 className="text-3xl font-bold text-center text-[#3F6592] mb-6">
            📑 Liste De Toutes Les Réservations
          </h2>
<br></br><br></br>
          {/* Recherche */}
          <div className="flex items-center mb-6">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Rechercher par vol, départ, transitaire..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3F6592] focus:outline-none"
            />
          </div>

          {/* Tableau */}
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
                  <th className="py-3 px-4">Ajouté par</th>

                  <th className="py-3 px-4">Détails</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReservations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-gray-500">
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
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold
      ${res.etat === "Acceptée" ? "bg-green-100 text-green-700" : ""}
      ${res.etat === "En attente" ? "bg-yellow-100 text-yellow-700" : ""}
      ${res.etat === "Annulée" ? "bg-red-100 text-red-700" : ""}
    `}
  >
    {res.etat || "En attente"}
  </span>
</td>
                      <td className="py-3 px-4">
  {res.user
    ? `${res.user.firstname || ""} ${res.user.lastname || ""} (${res.user.phone || "—"})`
    : "—"}
</td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            router.push(`/Administrateur/Reservations/${res._id}`)
                          }
                          className="text-xs text-white bg-[#3F6592] hover:bg-[#2c4e75] px-4 py-2 rounded-full transition"
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

          {/* Pagination */}
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
