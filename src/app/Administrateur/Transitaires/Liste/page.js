"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebare-admin";
import { FaEnvelope, FaUser, FaPhone,FaBriefcase,FaBuilding ,FaGlobe, FaCity,FaHome, FaBarcode ,FaIdBadge ,  FaEye, FaEdit, FaTrash, FaSearch, FaFileDownload, FaUserFriends, FaChevronRight, FaChevronLeft } from "react-icons/fa";

export default function PageTransitaires() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [transitaires, setTransitaires] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State pour la recherche dynamique
  const [selectedTransitaire, setSelectedTransitaire] = useState(null); // State pour les détails ou modification
  const [showDetails, setShowDetails] = useState(false); // Pour afficher la pop-up de détails
  const [showEdit, setShowEdit] = useState(false); // Pour afficher la pop-up de modification
  const [user, setUser] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({});
  const [selectedTransitaireIds, setSelectedTransitaireIds] = useState([]);


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
  

  // Fonction de recherche dynamique
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Fonction de suppression
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce transitaire ?")) {
      const response = await fetch(`/api/transitaires/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        setTransitaires((prevState) => prevState.filter((transitaire) => transitaire._id !== id));
        alert(data.message);
      } else {
        alert(data.message || "Erreur lors de la suppression.");
      }
    }
  };

  // Filtrage des transitaires en fonction de la recherche
  const filteredTransitaires = transitaires.filter((t) => {
    return (
      t.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.function.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(t.createdAt).toLocaleDateString().includes(searchTerm) 
    );
  });
  const totalPages = Math.ceil(filteredTransitaires.length / itemsPerPage);
  const displayedTransitaires = filteredTransitaires.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  // Afficher les détails dans une pop-up
  const showDetailsModal = (transitaire) => {
    setSelectedTransitaire(transitaire);
    setShowDetails(true);
  };

  // Fermer la pop-up des détails
  const closeDetailsModal = () => {
    setShowDetails(false);
    setSelectedTransitaire(null);
  };

  // Afficher la pop-up de modification
  const showEditModal = (transitaire) => {
    setSelectedTransitaire(transitaire);
    setFormData({ ...transitaire });// Remplir les champs du formulaire avec les données du transitaire
    setShowEdit(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/transitaires/${selectedTransitaire._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // Les nouvelles données à mettre à jour
      });
  
      const data = await response.json();
      if (response.ok) {
        // Mise à jour de l'état avec les nouvelles données
        setTransitaires((prevState) =>
          prevState.map((t) =>
            t._id === selectedTransitaire._id ? { ...t, ...formData } : t
          )
        );
        closeEditModal();
        alert("Transitaire modifié avec succès !");
      } else {
        alert(data.message || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Erreur serveur", error);
      alert("Erreur serveur");
    }
  };
  

  // Fermer la pop-up de modification
  const closeEditModal = () => {
    setShowEdit(false);
    setSelectedTransitaire(null);
  };

  // Handle select/deselect all checkboxes
const handleSelectAll = (e) => {
  if (e.target.checked) {
    // Select all
    setSelectedTransitaireIds(displayedTransitaires.map((t) => t._id));
  } else {
    // Deselect all
    setSelectedTransitaireIds([]);
  }
};

const toggleSelection = (id) => {
  setSelectedTransitaireIds((prevState) =>
    prevState.includes(id)
      ? prevState.filter((itemId) => itemId !== id) // Deselect
      : [...prevState, id] // Select
  );
};


  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-4 md:p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-white rounded-3xl py-12 px-8 shadow-lg relative overflow-x-auto">
          <button className="absolute top-14 right-8 flex items-center bg-[#3F6592] text-white py-1 px-4 rounded-full shadow-md">
            <FaUser className="mr-2" />
            <span>{user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}</span>
          </button>

          {/* Titre et recherche */}
          <div className="flex justify-start items-center mb-8 mt-6">
            <h1 className="text-2xl font-semibold text-[#3F6592]">Liste des Transitaires</h1>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-12 mt-20">
            <div className="relative w-full lg:w-auto">
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Chercher Transitaire..."
                className="border border-gray-300 rounded-full pl-10 pr-4 py-2 w-full lg:w-72 outline-none focus:ring-2 focus:ring-[#3F6592]"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center gap-4">
              <select className="border border-gray-300 rounded-full py-2 px-4" value={itemsPerPage} onChange={(e)=>setItemsPerPage(parseInt(e.target.value))}>
                <option value={5}>5 lignes</option>
                <option value={10}>10 lignes</option>
                <option value={15}>15 lignes</option>
                <option value={20}>20 lignes</option>
              </select>

              <select className="border border-gray-300 rounded-full py-2 px-4">
                <option>Exporter en :</option>
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
                <option>JSON</option>
              </select>
              <button className="bg-[#3F6592] text-white px-3 py-2 rounded-full">
                <FaFileDownload />
              </button>
              <button className="bg-[#0EC953] text-white px-5 py-2 rounded-full font-semibold" onClick={() => (window.location.href = "/Administrateur/Transitaires/Ajout")}>Ajouter</button>

            </div>
          </div>

          {/* Tableau des transitaires */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="min-w-full">
<thead className="bg-[#3F6592] text-white text-left">
  <tr>
    <th className="p-3 border-b border-gray-300">
<input type="checkbox" onChange={handleSelectAll} checked={displayedTransitaires.length === selectedTransitaireIds.length}/* Check if all items are selected *//></th>
    <th className="p-3 border-b border-gray-300">Création</th>
    {["Nom", "Prénom", "Email", "Téléphone", "Fonction", "Entreprise", "Rôle", "Détails", "Modifier", "Supprimer"].map((head, idx) => (
      <th key={idx} className="p-3 border-b border-gray-300">{head}</th>
    ))}
  </tr>
</thead>

<tbody>
  {displayedTransitaires.length === 0 ? (
    <tr>
      <td colSpan="10" className="text-center py-4 text-gray-500">Aucun transitaire trouvé.</td>
    </tr>
  ) : (
    displayedTransitaires.map((t, i) => (
      <tr
        key={i}
        className={`${i % 2 ? "bg-gray-100" : "bg-white"} border-b border-gray-300`}
      >
        <td className="p-2">
          <input
            type="checkbox"
            checked={selectedTransitaireIds.includes(t._id)}
            onChange={() => toggleSelection(t._id)}
          />
        </td>
        <td className="p-2">{new Date(t.createdAt).toLocaleDateString()}</td>
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
          <FaEye className="text-blue-500 cursor-pointer" onClick={() => showDetailsModal(t)} />
        </td>
        <td className="p-2 text-center">
          <FaEdit className="text-yellow-500 cursor-pointer" onClick={() => showEditModal(t)} />
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
          <div className="mt-5 flex justify-center items-center gap-3">
            <button disabled={currentPage===1} onClick={()=>setCurrentPage(currentPage-1)}><FaChevronLeft/></button>
            {[...Array(totalPages)].map((_,i)=>(<button key={i} onClick={()=>setCurrentPage(i+1)} className={`px-3 py-1 rounded ${currentPage===i+1?"bg-[#3F6592] text-white":"bg-gray-200"}`}>{i+1}</button>))}
            <button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(currentPage+1)}><FaChevronRight/></button>
          </div>
        </div>

      

        {showDetails && selectedTransitaire && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-60 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl shadow-2xl w-[90%] md:w-[500px] p-6 overflow-y-auto max-h-[90vh]">
      
      <h2 className="text-xl font-bold mb-5 text-center border-b pb-3 text-[#3F6592]">
        🔍 Détails du Transitaire
      </h2>

      <div className="space-y-3 text-gray-700">
        <p><FaUser className="inline mr-2 text-[#3F6592]"/> <strong>Nom :</strong> {selectedTransitaire.lastname}</p>
        <p><FaUser className="inline mr-2 text-[#3F6592]"/> <strong>Prénom :</strong> {selectedTransitaire.firstname}</p>
        <p><FaEnvelope className="inline mr-2 text-[#3F6592]"/> <strong>Email :</strong> {selectedTransitaire.email}</p>
        <p><FaPhone className="inline mr-2 text-[#3F6592]"/> <strong>Téléphone :</strong> {selectedTransitaire.phone}</p>
        <p><FaBriefcase className="inline mr-2 text-[#3F6592]"/> <strong>Fonction :</strong> {selectedTransitaire.function}</p>
        <p><FaBuilding className="inline mr-2 text-[#3F6592]"/> <strong>Entreprise :</strong> {selectedTransitaire.company}</p>
        <p><FaGlobe className="inline mr-2 text-[#3F6592]"/> <strong>Pays :</strong> {selectedTransitaire.country}</p>
        <p><FaCity className="inline mr-2 text-[#3F6592]"/> <strong>Ville :</strong> {selectedTransitaire.city}</p>
        <p><FaHome className="inline mr-2 text-[#3F6592]"/> <strong>Adresse :</strong> {selectedTransitaire.address}</p>
        <p><FaBarcode className="inline mr-2 text-[#3F6592]"/> <strong>Code Postal :</strong> {selectedTransitaire.postalCode}</p>
        <p><FaIdBadge className="inline mr-2 text-[#3F6592]"/> <strong>ID Compagnie :</strong> {selectedTransitaire.companyID}</p>
        <p><FaIdBadge className="inline mr-2 text-[#3F6592]"/> <strong>Numéro CASS :</strong> {selectedTransitaire.cassNumber}</p>
      </div>

      <div className="flex justify-center mt-6">
        <button onClick={closeDetailsModal} className="bg-red-500 hover:bg-red-600 text-white py-2 px-5 rounded-full shadow-md transition-colors">
          ✖️ Fermer
        </button>
      </div>

    </div>
  </div>
)}


        {/* Pop-up de modification */}
        {showEdit && selectedTransitaire && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-60 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl shadow-2xl w-[90%] md:w-[500px] p-6 overflow-y-auto max-h-[90vh]">
      
      <h2 className="text-xl font-bold mb-6 text-center border-b pb-3 text-[#3F6592]">
        ✏️ Modifier le Transitaire
      </h2>

      <form onSubmit={handleEditSubmit} className="grid grid-cols-1 gap-4">

        {/* prénom et nom */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="firstname" value={formData.firstname || ''} onChange={(e)=>setFormData({...formData, firstname:e.target.value})} placeholder="Prénom" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="lastname" value={formData.lastname || ''} onChange={(e)=>setFormData({...formData, lastname:e.target.value})} placeholder="Nom" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
        </div>

        {/* Email & Téléphone */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input type="email" name="email" value={formData.email || ''} onChange={(e)=>setFormData({...formData, email:e.target.value})} placeholder="Email" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
          <div className="relative">
            <FaPhone className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="phone" value={formData.phone || ''} onChange={(e)=>setFormData({...formData, phone:e.target.value})} placeholder="Téléphone" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
        </div>

        {/* Fonction et Entreprise */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <FaBriefcase className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="function" value={formData.function || ''} onChange={(e)=>setFormData({...formData, function:e.target.value})} placeholder="Fonction" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
          <div className="relative">
            <FaBuilding className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="company" value={formData.company || ''} onChange={(e)=>setFormData({...formData, company:e.target.value})} placeholder="Entreprise" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
        </div>

        {/* Pays et Ville */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <FaGlobe className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="country" value={formData.country || ''} onChange={(e)=>setFormData({...formData, country:e.target.value})} placeholder="Pays" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
          <div className="relative">
            <FaCity className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="city" value={formData.city || ''} onChange={(e)=>setFormData({...formData, city:e.target.value})} placeholder="Ville" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
        </div>

        {/* Adresse et Code postal */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <FaHome className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="address" value={formData.address || ''} onChange={(e)=>setFormData({...formData, address:e.target.value})} placeholder="Adresse" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
          <div className="relative">
            <FaBarcode className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="postalCode" value={formData.postalCode || ''} onChange={(e)=>setFormData({...formData, postalCode:e.target.value})} placeholder="Code postal" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
        </div>

        {/* ID compagnie et Numéro CASS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <FaIdBadge className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="companyID" value={formData.companyID || ''} onChange={(e)=>setFormData({...formData, companyID:e.target.value})} placeholder="ID Compagnie" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
          <div className="relative">
            <FaIdBadge className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="cassNumber" value={formData.cassNumber || ''} onChange={(e)=>setFormData({...formData, cassNumber:e.target.value})} placeholder="Numéro CASS" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-3 mt-4">
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white py-2 px-5 rounded-full shadow-md transition-colors">
             Enregistrer
          </button>
          <button type="button" onClick={closeEditModal} className="bg-red-500 hover:bg-red-600 text-white py-2 px-5 rounded-full shadow-md transition-colors">
            ✖️ Fermer
          </button>
        </div>

      </form>

    </div>
  </div>
)}

      </main>
    </div>
  );
}
