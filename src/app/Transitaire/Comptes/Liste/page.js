"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { FaUser, FaEye, FaEdit, FaTrash,FaSearch,FaFileDownload, FaUserFriends,FaChevronRight, FaChevronLeft } from "react-icons/fa";

export default function PageTransitaires() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [transitaires, setTransitaires] = useState([]);
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
    const fetchTransitaires = async () => {
      try {
        const res = await fetch("/api/transitaires");
        const data = await res.json();
        if (res.ok) {
          setTransitaires(data);
        }
      } catch (err) {
        console.error("Erreur chargement transitaires :", err);
      }
    };
    fetchUser();
    fetchTransitaires();
    

  }, []);
  
  
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce transitaire ?")) {
      const response = await fetch(`/api/transitaires/${id}`, {
        method: "DELETE", 
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setTransitaires((prevState) => prevState.filter((transitaire) => transitaire._id !== id)); // Mettre à jour l'état après suppression
        alert(data.message);  // Afficher un message de succès
      } else {
        alert(data.message || "Erreur lors de la suppression.");
      }
    }
  };
  
  
  

  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-4 md:p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
  <div className="bg-white rounded-3xl py-12 px-8 shadow-lg relative overflow-x-auto">

    {/* Bouton utilisateur ajusté */}
    <button className="absolute top-14 right-8 flex items-center bg-[#3F6592] text-white py-1 px-4 rounded-full shadow-md">
      <FaUser className="mr-2" />
      <span>{user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}</span>
    </button>

    {/* Titre seul */}
    {/* TITRE avec marge inchangée */}
<div className="flex justify-start items-center mb-8 mt-6">
  <h1 className="text-2xl font-semibold text-[#3F6592]">
    Liste des sous-comptes
  </h1>
</div>

{/* BARRE DE RECHERCHE : ajout précis de "mt-10" */}
<div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-12 mt-20">
  <div className="relative w-full lg:w-auto">
    <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
    <input
      type="text"
      placeholder="Chercher utilisateur..."
      className="border border-gray-300 rounded-full pl-10 pr-4 py-2 w-full lg:w-72 outline-none focus:ring-2 focus:ring-[#3F6592]"
    />
  </div>

  <div className="flex flex-wrap justify-center lg:justify-end items-center gap-3">
    <select className="border border-gray-300 rounded-full py-2 px-3">
      <option>5 lignes</option>
      <option>10 lignes</option>
      <option>15 lignes</option>
      <option>20 lignes</option>
    </select>
    <select className="border border-gray-300 rounded-full py-2 px-3">
      <option>Exporter en :</option>
      <option>PDF</option>
      <option>Excel</option>
      <option>CSV</option>
      <option>JSON</option>
    </select>
    <button className="bg-[#3F6592] text-white px-3 py-2 rounded-full">
      <FaFileDownload />
    </button>
    <button
      className="bg-[#0EC953] text-white px-5 py-2 rounded-full font-semibold whitespace-nowrap"
      onClick={() => (window.location.href = "/Transitaire/Comptes/Ajout")}
    >
      Ajouter
    </button>
  </div>
</div>


    {/* Tableau avec bordure extérieure et lignes séparatrices */}
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-[#3F6592] text-white text-left">
          <tr>
            {["Nom", "Prénom", "Email", "Téléphone", "Fonction", "Entreprise", "Rôle", "Détails", "Modifier", "Supprimer"].map((head, idx) => (
              <th key={idx} className="p-3 border-b border-gray-300">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transitaires.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center py-4 text-gray-500">
                Aucun Sous-compte trouvé.
              </td>
            </tr>
          ) : (
            transitaires.map((t, i) => (
              <tr key={i} className={`${i % 2 ? "bg-gray-100" : "bg-white"} border-b border-gray-300`}>
                <td className="p-2">{t.lastname}</td>
                <td className="p-2">{t.firstname}</td>
                <td className="p-2">{t.email}</td>
                <td className="p-2">{t.phone}</td>
                <td className="p-2">{t.function}</td>
                <td className="p-2">{t.company}</td>
                <td className="p-2">
                  <div className="flex flex-col items-start">
                    <span
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm ${
                        t.role === "transitaire-secondaire" ? "bg-indigo-400" : "bg-green-500"
                      }`}
                      title={t.role === "transitaire-secondaire" ? `Ajouté par : ${t.ajoutePar || 'inconnu'}` : ''}
                    >
                      {t.role}
                      {t.role === "transitaire-secondaire" && <FaUserFriends />}
                    </span>
                    {t.role === "transitaire-secondaire" && (
                      <span className="text-xs text-gray-500 mt-1">
                        Ajouté par {t.ajoutePar || "inconnu"}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-2 text-center">
                  <FaEye className="text-blue-500 cursor-pointer" />
                </td>
                <td className="p-2 text-center">
                  <FaEdit className="text-yellow-500 cursor-pointer" />
                </td>
                <td className="p-2 text-center">
                  <FaTrash className="text-red-500 cursor-pointer" onClick={() => handleDelete(t._id)} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <div className="mt-6 flex justify-center items-center gap-2">
      <button className="bg-gray-200 rounded p-1">
        <FaChevronLeft />
      </button>
      <button className="bg-[#3F6592] text-white px-3 py-1 rounded">1</button>
      <button className="bg-gray-200 rounded p-1">
        <FaChevronRight />
      </button>
    </div>

  </div>
</main>


    </div>
  );
}
