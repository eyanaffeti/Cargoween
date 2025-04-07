"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { FaUser, FaEye, FaEdit, FaTrash, FaUserFriends } from "react-icons/fa";

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
      <main className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-white rounded-3xl p-32 shadow-lg relative">
          {/* User display */}
          <button className="absolute top-5 right-7 flex items-center bg-[#3F6592] text-white py-2 px-6 rounded-full shadow-md">
            <FaUser className="mr-2" />
            <span>{user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}</span>
          </button>
          <div className="flex justify-between items-center mb-12 center">
            <h1 className="text-2xl font-semibold text-[#3F6592]">Liste des sous-compte</h1>
            <button className="bg-[#0EC953] text-white px-6 py-2 rounded-full font-semibold" onClick={() => (window.location.href = "/Transitaire/Comptes/Ajout")}>Ajouter</button>
          </div>

          <div className="overflow-x-auto rounded-xl border-2 border-[#3F6592]">
            <table className="min-w-full">
              <thead className="bg-[#3F6592] text-white text-left">
                <tr>
                  <th className="p-3">Nom</th>
                  <th className="p-3">Prénom</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Téléphone</th>
                  <th className="p-3">Fonction</th>
                  <th className="p-3">Entreprise</th>
                  <th className="p-3">Rôle</th>
                  <th className="p-3">Détails</th>
                  <th className="p-3">Modifier</th>
                  <th className="p-3">Supprimer</th>
                </tr>
              </thead>
              <tbody>
  {transitaires.length === 0 ? (
    <tr>
      <td colSpan="10" className="text-center py-8 text-gray-500">
        Aucun transitaire trouvé.
      </td>
    </tr>
  ) : (
    transitaires.map((t, i) => (
      <tr
        key={i}
        className={`${t.role === "transitaire-secondaire" ? "bg-[#EAF4FF]" : "bg-white"} border-b`}
        title={t.role === "transitaire-secondaire" ? `Ajouté par ${t.ajoutePar}` : ""}
      >
        <td className="p-3">{t.lastname}</td>
        <td className="p-3">{t.firstname}</td>
        <td className="p-3">{t.email}</td>
        <td className="p-3">{t.phone}</td>
        <td className="p-3">{t.function}</td>
        <td className="p-3">{t.company}</td>
        <td className="p-3">
  <div className="flex flex-col items-start">
    {/*  Badge avec couleur dynamique */}
    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm 
      ${t.role === "transitaire-secondaire" ? "bg-indigo-400" : "bg-green-500"}`}>
      {t.role}
      {/* Icône utilisateur (secondaire uniquement) */}
      {t.role === "transitaire-secondaire"  && <FaUserFriends />}
    </span>

    {/* Mini texte sous le badge */}
    {t.role === "transitaire-secondaire" && (
      <span className="text-xs text-gray-500 mt-1">Ajouté par {t.ajoutePar || "inconnu"}</span>
    )}
  </div>
</td>


        <td className="p-3 text-center">
          <button title="Voir détails">
            <FaEye className="text-blue-600 hover:text-blue-800 text-lg" />
          </button>
        </td>
        <td className="p-3 text-center">
          <button title="Modifier">
            <FaEdit className="text-yellow-500 hover:text-yellow-600 text-lg" />
          </button>
        </td>
        <td className="p-3 text-center">
  <button onClick={() => handleDelete(t._id)} title="Supprimer">
    <FaTrash className="text-red-500 hover:text-red-700 text-lg" />
  </button>
</td>

      </tr>
    ))
  )}
</tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
