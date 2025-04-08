"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebare-admin";
import { FaUser, FaEye, FaEdit, FaTrash, FaSearch, FaFileDownload, FaUserFriends, FaChevronRight, FaChevronLeft } from "react-icons/fa";

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
      t.role.toLowerCase().includes(searchTerm.toLowerCase())
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
              <button className="bg-[#0EC953] text-white px-5 py-2 rounded-full font-semibold" onClick={() => (window.location.href = "/Transitaire/Comptes/Ajout")}>Ajouter</button>

            </div>
          </div>

          {/* Tableau des transitaires */}
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
                { displayedTransitaires.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4 text-gray-500">Aucun transitaire trouvé.</td>
                  </tr>
                ) : (
                  displayedTransitaires.map((t, i) => (
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
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm ${t.role === "transitaire-secondaire" ? "bg-indigo-400" : "bg-green-500"}`}
                            title={t.role === "transitaire-secondaire" ? `Ajouté par : ${t.ajoutePar || 'inconnu'}` : ''}
                          >
                            {t.role}
                            {t.role === "transitaire-secondaire" && <FaUserFriends />}
                          </span>
                          {t.role === "transitaire-secondaire" && (
                            <span className="text-xs text-gray-500 mt-1">Ajouté par {t.ajoutePar || "inconnu"}</span>
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

      

        {/* Pop-up de détails */}
        {showDetails && selectedTransitaire && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
              <h2 className="text-xl font-semibold">Détails du transitaire</h2>
              <p><strong>Nom:</strong> {selectedTransitaire.lastname}</p>
              <p><strong>Prénom:</strong> {selectedTransitaire.firstname}</p>
              <p><strong>Email:</strong> {selectedTransitaire.email}</p>
              <p><strong>Téléphone:</strong> {selectedTransitaire.phone}</p>
              <p><strong>Fonction:</strong> {selectedTransitaire.function}</p>
              <p><strong>Entreprise:</strong> {selectedTransitaire.company}</p>
              <p><strong>Pays:</strong> {selectedTransitaire.country}</p>
              <p><strong>Ville:</strong> {selectedTransitaire.city}</p>
              <p><strong>Adresse:</strong> {selectedTransitaire.address}</p>
              <p><strong>Code Postal:</strong> {selectedTransitaire.postalCode}</p>
              <p><strong>ID Compagnie:</strong> {selectedTransitaire.companyID}</p>
              <p><strong>Num CASS:</strong> {selectedTransitaire.cassNumber}</p>
              <button onClick={closeDetailsModal} className="bg-red-500 text-white p-2 rounded mt-4">Fermer</button>
            </div>
          </div>
        )}

        {/* Pop-up de modification */}
        {showEdit && selectedTransitaire && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
              <h2 className="text-xl font-semibold">Modifier le transitaire</h2>
              {/* Formulaire de modification à adapter à votre design */}
              <form onSubmit={handleEditSubmit} className="space-y-4">
  <input
    type="text"
    name="firstname"
    value={formData.firstname || ''}
    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
    className="border p-2 rounded"
    placeholder="Prénom"
  />
  
  <input
    type="text"
    name="lastname"
    value={formData.lastname || ''}
    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
    className="border p-2 rounded"
    placeholder="Nom"
  />

  <input
    type="email"
    name="email"
    value={formData.email || ''}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    className="border p-2 rounded"
    placeholder="Email"
  />

  <input
    type="text"
    name="phone"
    value={formData.phone || ''}
    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
    className="border p-2 rounded"
    placeholder="Téléphone"
  />

  <input
    type="text"
    name="function"
    value={formData.function || ''}
    onChange={(e) => setFormData({ ...formData, function: e.target.value })}
    className="border p-2 rounded"
    placeholder="Fonction"
  />

  <input
    type="text"
    name="company"
    value={formData.company || ''}
    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
    className="border p-2 rounded"
    placeholder="Entreprise"
  />

  <input
    type="text"
    name="country"
    value={formData.country || ''}
    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
    className="border p-2 rounded"
    placeholder="Pays"
  />

  <input
    type="text"
    name="city"
    value={formData.city || ''}
    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
    className="border p-2 rounded"
    placeholder="Ville"
  />

  <input
    type="text"
    name="address"
    value={formData.address || ''}
    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
    className="border p-2 rounded"
    placeholder="Adresse"
  />

  <input
    type="text"
    name="postalCode"
    value={formData.postalCode || ''}
    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
    className="border p-2 rounded"
    placeholder="Code Postal"
  />

  <input
    type="text"
    name="companyID"
    value={formData.companyID || ''}
    onChange={(e) => setFormData({ ...formData, companyID: e.target.value })}
    className="border p-2 rounded"
    placeholder="ID Compagnie"
  />

  <input
    type="text"
    name="cassNumber"
    value={formData.cassNumber || ''}
    onChange={(e) => setFormData({ ...formData, cassNumber: e.target.value })}
    className="border p-2 rounded"
    placeholder="Num CASS"
  />

  <button type="submit" className="bg-green-500 text-white p-2 rounded">
    Enregistrer
  </button>

  <button type="button" onClick={closeEditModal} className="bg-red-500 text-white p-2 rounded">
    Fermer
  </button>
</form>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
