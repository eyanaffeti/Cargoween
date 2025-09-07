"use client";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

import { useState, useEffect } from "react";
import {
  FaUser, FaSearch, FaEuroSign, FaChevronDown, FaEdit,
  FaSignOutAlt, FaEye, FaTrash
} from "react-icons/fa";
import Sidebar from "@/components/Sidebar-airline";

export default function MesOffres() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [offres, setOffres] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  // Popups
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    const fetchUserAndOffres = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const resUser = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await resUser.json();
      setUser(userData);

      if (resUser.ok) {
        const res = await fetch(`/api/offres?airline=${userData._id}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const minPrice = Math.min(...data.map(o => o.tarifKg));
          const avgPrice = data.reduce((s, o) => s + o.tarifKg, 0) / data.length;
          const sorted = [...data].sort((a, b) => a.tarifKg - b.tarifKg);
          const top3 = sorted.slice(0, 3).map(o => o._id.toString());

          const offresAvecTags = data.map(o => {
            const tags = [];
            if (o.tarifKg === minPrice) tags.push("Cheap");
            if (top3.includes(o._id.toString())) tags.push("Best");
            if (o.tarifKg < avgPrice) tags.push("Green");
            return { ...o, tags };
          });
          setOffres(offresAvecTags);
        } else {
          setOffres([]);
        }
      }
    };
    fetchUserAndOffres();
  }, []);

  // Pagination
  const filteredOffres = offres.filter(
    (o) =>
      o.from.toLowerCase().includes(search.toLowerCase()) ||
      o.to.toLowerCase().includes(search.toLowerCase()) ||
      o.flightNumber.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (page - 1) * perPage;
  const paginatedOffres = filteredOffres.slice(startIndex, startIndex + perPage);
  const totalPages = Math.ceil(filteredOffres.length / perPage);

  // Suppression
const handleDelete = async (id) => {
  // Au lieu de confirm()
  setToast({
    show: true,
    message: (
      <div className="flex flex-col gap-2">
        <p>⚠️ Supprimer cette offre ?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              try {
                await fetch(`/api/offres/${id}`, { method: "DELETE" });
                setOffres(offres.filter((o) => o._id !== id));
                setToast({ show: true, message: "✅ Offre supprimée", type: "success" });
              } catch {
                setToast({ show: true, message: "❌ Erreur lors de la suppression", type: "error" });
              }
              setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Oui
          </button>
          <button
            onClick={() => setToast({ show: false, message: "", type: "" })}
            className="bg-gray-300 px-3 py-1 rounded-md text-sm"
          >
            Non
          </button>
        </div>
      </div>
    ),
    type: "warning",
  });
};



  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main
        className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <div className="bg-white rounded-3xl p-10 shadow-lg relative">
 {/* Dropdown profil */}
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
<br></br> 
          {/* Header */}
          <h2 className="text-2xl font-bold text-[#3F6592] mb-16 text-center">
            📋 Mes Offres de Fret Aérien
          </h2>
{/* Header avec bouton Ajouter + Recherche alignés */}
<div className="flex justify-between items-center mb-8">
  {/* Bouton à gauche */}
  <button
    onClick={() => router.push("/Airline/offre/Ajout")}
    className="bg-[#0EC953] hover:bg-green-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2"
  >
    ➕ Ajouter une offre
  </button>

  {/* Barre de recherche à droite */}
  <div className="flex items-center w-1/3 min-w-[250px] border-2 border-[#3F6592] rounded-lg px-6 py-3">
    <FaSearch className="text-gray-600 mr-4 text-lg flex-shrink-0" />
    <input
      type="text"
      placeholder="Rechercher (aéroport ou n° vol)..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full outline-none text-sm"
    />
  </div>
</div>

{toast.show && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={() => setToast({ show: false, message: "", type: "" })}
  />
)}




          {/* Tableau */}
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-full bg-white border-collapse text-sm rounded-lg overflow-hidden">
              <thead className="bg-[#3F6592] text-white">
                <tr>
                  <th className="py-3 px-4 text-left">✈️ Vol</th>
                  <th className="py-3 px-4 text-center">📍 De</th>
                  <th className="py-3 px-4 text-center">📍 À</th>
                  <th className="py-3 px-4 text-center">📅 Départ</th>
                  <th className="py-3 px-4 text-center">📅 Arrivée</th>
                  <th className="py-3 px-4 text-center">💰 Tarif (kg)</th>
                  <th className="py-3 px-4 text-center">🏷️ Tags</th>
                  <th className="py-3 px-4 text-center">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOffres.length > 0 ? (
                  paginatedOffres.map((offre, idx) => (
                    <tr
                      key={offre._id}
                      className={`${
                        idx % 2 === 0 ? "bg-gray-100" : "bg-white"
                      } border-b`}
                    >
                      <td className="py-3 px-4 font-semibold">{offre.flightNumber}</td>
                      <td className="py-3 px-4 text-center">{offre.from}</td>
                      <td className="py-3 px-4 text-center">{offre.to}</td>
                      <td className="py-3 px-4 text-center">
                        {new Date(offre.departureDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {new Date(offre.arrivalDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {offre.tarifKg.toFixed(2)} <FaEuroSign className="inline" />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-1 flex-wrap justify-center">
                          {offre.tags?.map((tag, i) => (
                            <span
                              key={i}
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white
                                ${
                                  tag === "Cheap"
                                    ? "bg-purple-600"
                                    : tag === "Best"
                                    ? "bg-blue-600"
                                    : tag === "Green"
                                    ? "bg-green-600"
                                    : "bg-gray-500"
                                }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <button
                          onClick={() => { setSelectedOffre(offre); setShowDetails(true); }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => { setSelectedOffre(offre); setShowEdit(true); }}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-md text-xs"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(offre._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-gray-500 font-medium">
                      ❌ Aucune offre trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#3F6592] text-white rounded-lg disabled:opacity-50"
            >
              ⬅️ Précédent
            </button>
            <span className="text-gray-700 font-medium">
              Page {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-[#3F6592] text-white rounded-lg disabled:opacity-50"
            >
              Suivant ➡️
            </button>
          </div>
        </div>

      {/* 🔹 Modal Détails */}
{showDetails && selectedOffre && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 relative">
      
      {/* Header */}
      <h3 className="text-2xl font-bold text-[#3F6592] mb-6 border-b pb-3">
        ✈️ Détails de l’offre
      </h3>

      {/* Contenu sous forme de tableau */}
      <div className="grid grid-cols-2 gap-6 text-gray-700">
        <div>
          <p className="font-semibold">Numéro de vol</p>
          <p className="bg-gray-100 p-2 rounded-md">{selectedOffre.flightNumber}</p>
        </div>
        <div>
          <p className="font-semibold">Tarif (kg)</p>
          <p className="bg-gray-100 p-2 rounded-md">{Number(selectedOffre.tarifKg).toFixed(2)} €</p>
        </div>
        <div>
          <p className="font-semibold">Aéroport de départ</p>
          <p className="bg-gray-100 p-2 rounded-md">{selectedOffre.from}</p>
        </div>
        <div>
          <p className="font-semibold">Aéroport d’arrivée</p>
          <p className="bg-gray-100 p-2 rounded-md">{selectedOffre.to}</p>
        </div>
        <div>
          <p className="font-semibold">Date de départ</p>
          <p className="bg-gray-100 p-2 rounded-md">
            {new Date(selectedOffre.departureDate).toLocaleString("fr-FR")}
          </p>
        </div>
        <div>
          <p className="font-semibold">Date d’arrivée</p>
          <p className="bg-gray-100 p-2 rounded-md">
            {new Date(selectedOffre.arrivalDate).toLocaleString("fr-FR")}
          </p>
        </div>
      </div>

      {/* Tags */}
      {selectedOffre.tags?.length > 0 && (
        <div className="mt-6">
          <p className="font-semibold text-gray-800 mb-2">🏷️ Tags</p>
          <div className="flex gap-2 flex-wrap">
            {selectedOffre.tags.map((tag, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-full text-xs font-semibold text-white
                  ${tag === "Cheap" ? "bg-purple-600" : ""}
                  ${tag === "Best" ? "bg-blue-600" : ""}
                  ${tag === "Green" ? "bg-green-600" : ""}
                `}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => setShowDetails(false)}
          className="bg-[#3F6592] hover:bg-[#2d4a6d] text-white px-6 py-2 rounded-lg shadow-md"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
)}


        {/* 🔹 Modal Edition */}
        {showEdit && selectedOffre && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-1/2">
              <h3 className="text-xl font-bold text-yellow-600 mb-4">Modifier l’offre</h3>
              {/* Exemple : juste l’édition du prix */}
           <input
  type="number"
  value={selectedOffre.tarifKg ?? ""}   // si null/undefined → affiche ""
  onChange={(e) => setSelectedOffre({
    ...selectedOffre,
    tarifKg: e.target.value === "" ? "" : e.target.value   // garde string tant que l'utilisateur tape
  })}
  className="border p-2 rounded w-full mb-4"
/>

              <div className="flex justify-end gap-2">
                <button onClick={() => setShowEdit(false)} className="bg-gray-400 text-white px-4 py-2 rounded-lg">
                  Annuler
                </button>
               <button
  onClick={async () => {
    await fetch(`/api/offres/${selectedOffre._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...selectedOffre,
        tarifKg: selectedOffre.tarifKg === "" ? 0 : Number(selectedOffre.tarifKg)  // ✅ conversion
      }),
    });

    // Mets à jour ton state local
    setOffres(offres.map(o =>
      o._id === selectedOffre._id
        ? { ...selectedOffre, tarifKg: selectedOffre.tarifKg === "" ? 0 : Number(selectedOffre.tarifKg) }
        : o
    ));

    setShowEdit(false);
  }}
  className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
>
  Sauvegarder
</button>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  
);
}
