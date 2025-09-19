"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebare-admin";
import { FaUser, FaChevronDown,
  FaEdit,
  FaSignOutAlt, } from "react-icons/fa";
import RouteDetails from '@/components/RouteDetails';
import CargoDetails from '@/components/CargoDetails';
import Toast from "@/components/Toast";
import { useRouter } from "next/navigation";


export default function ReservationDetails() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reservation, setReservation] = useState(null);
  const [awb, setAwb] = useState("");
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
const [availableAwbs, setAvailableAwbs] = useState([]);
const [loadingAwbs, setLoadingAwbs] = useState(true);
const [awbType, setAwbType] = useState("Paper AWB"); 
const [comment, setComment] = useState(""); // pour le commentaire LTA
const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const router = useRouter();

useEffect(() => {
  const fetchAvailableAwbs = async () => {
    setLoadingAwbs(true); // commence le chargement

    const res = await fetch("/api/awb/available");
    const data = await res.json();

    if (res.ok) {
      setAvailableAwbs(data);
    }

    setLoadingAwbs(false); // termine le chargement ici, après fetch
  };

  fetchAvailableAwbs();
}, []);




  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/auth/me", {
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
setComment(data.awbComment || "");

      const marchandiseId =
        data?.marchandise?._id || data?.marchandise;

      // Vérifie que l'ID est bien présent
      if (!marchandiseId) {
        console.error("❌ ID marchandise invalide :", data.marchandise);
        return;
      }

      try {
        const marchandiseRes = await fetch(`/api/marchandise/${marchandiseId}`);
        const marchandiseData = await marchandiseRes.json();

        if (marchandiseRes.ok) {
          setReservation(prev => ({
            ...prev,
            marchandise: marchandiseData,
          }));
        } else {
          console.error("❌ Erreur récupération marchandise :", marchandiseData);
        }
      } catch (err) {
        console.error("❌ Erreur serveur marchandise :", err);
      }
    } else {
      console.error("❌ Erreur récupération réservation :", data);
    }
  }

  if (id) fetchReservation();
}, [id]);

const redirectToKonnect = async () => {
  const response = await fetch("/api/konnect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reservationId: reservation._id,
      amount: reservation.tarif * reservation.totalWeight + 50 + 30 + 20, // montant total
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      phone: user.phone,
    }),
  });

  const data = await response.json();
  
if (response.ok && data.paymentUrl) {
  window.location.href = data.paymentUrl;
} else {
  console.error("❌ Réponse inattendue de Konnect :", data);
  setToast({ show: true, type: "error", message: data.message || "Erreur redirection Konnect" });
}


};
  const handleSaveAwb = async () => {
    const res = await fetch(`/api/reservation/${id}/awb`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        awb, comment  }),
    });
      const data = await res.json();

    if (res.ok) {
    setToast({ show: true, message: "✅ Numéro LTA mis à jour avec succès !", type: "success" });
  await redirectToKonnect(); 
  } else {
    setToast({ show: true, message: "❌ " + (data.message || "Erreur lors de la mise à jour."), type: "error" });
  }
  };

  const airlineLogo = `https://images.kiwi.com/airlines/64/${reservation?.airline}.png`;

  if (!reservation) return <div className="text-center py-10"><div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex flex-col justify-center items-center">
  <img src="/preloader.gif" alt="Chargement..." className="w-54 h-44 mb-4" />
  <span className="text-[#3F6592] font-semibold text-lg">chargement en cours...</span>
</div></div>;


  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`flex-1 bg-[#F0F6FE] min-h-screen p-6 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-white rounded-xl shadow-md p-8 relative">

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
                         onClick={() => router.push("/Administrateur/Profil")}
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
<h2 className="text-2xl font-bold text-center text-[#3F6592]  mt-4 mb-10">Détails de Reservation</h2>
          <div className="grid grid-cols-12 gap-6 mt-16">

            {/* Route Details */}
            
            <div className="col-span-5">
   <RouteDetails reservation={reservation} />
   <br></br>
    <CargoDetails marchandise={reservation.marchandise} /> 

</div>


            <div className="col-span-7 flex flex-col gap-6">

     {/* RATE */}
<div className="bg-[#3F6592] text-white rounded-xl p-6">
  <h3 className="text-center font-semibold text-lg mb-3">RATE</h3>
  <div className="bg-[#CFE5FF] text-[#3F6592] rounded-lg p-4 space-y-1 text-sm">
    <div className="flex justify-between">
      <span>Rate Fret ({reservation.tarif.toFixed(2)} €/Kg × {reservation.totalWeight} kg)</span>
      <span>{(reservation.tarif * reservation.totalWeight).toFixed(2)} €</span>
    </div>
    <div className="flex justify-between">
      <span>Frais LTA</span>
      <span>50.00 €</span>
    </div>
    <div className="flex justify-between">
      <span>Frais Scanner</span>
      <span>30.00 €</span>
    </div>
    <div className="flex justify-between">
      <span>Surcharge Fuel</span>
      <span>20.00 €</span>
    </div>
    <div className="flex justify-between">
      <span>Autres Frais</span>
      <span>0.00 €</span>
    </div>

    <div className="border-t border-[#3F6592] pt-2 font-semibold flex justify-between">
      <span>Total ALL IN Cost</span>
      <span>
        {(reservation.tarif * reservation.totalWeight + 50 + 30 + 20 + 0).toFixed(2)} €
      </span>
    </div>
  </div>
  <p className="text-center font-bold mt-2">
    Total {(reservation.tarif * reservation.totalWeight + 50 + 30 + 20 + 0).toFixed(2)} €
  </p>
</div>

{/* AWB NUMBER */}
<div className="bg-[#3F6592] text-white rounded-xl p-6">
  <h3 className="font-semibold mb-4">Numéro LTA</h3>

  {reservation?.awb ? (
    // 🔒 Mode détails si un AWB existe déjà
    <div className="bg-white text-[#3F6592] rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Numéro attribué :</span>
        <span className="px-3 py-1 rounded-full bg-[#3F6592] text-white font-bold">
          {reservation.awb}
        </span>
      </div>
      <div className="flex justify-between">
        <span>Type :</span>
        <span>{reservation.awbType || "—"}</span>
      </div>
      {reservation.awbComment && (
        <div>
          <span className="font-semibold">Commentaire :</span>
          <p className="text-sm mt-1 italic">{reservation.awbComment}</p>
        </div>
      )}
    </div>
  ) : (
    // ✍️ Mode sélection si aucun AWB n’est encore assigné
    <>
      <div className="flex gap-2 mb-3 items-center">
        {loadingAwbs ? (
          <p className="text-sm italic text-gray-200">
            Chargement des numéros LTA...
          </p>
        ) : availableAwbs.length === 0 ? (
          <p className="text-red-300 text-sm">
            Aucun numéro LTA disponible. Veuillez en ajouter.
          </p>
        ) : (
          <select
            value={awb || ""}
            onChange={(e) => {
              const selectedNumber = e.target.value;
              setAwb(selectedNumber);

              const foundAwb = availableAwbs.find((a) => a.number === selectedNumber);
              if (foundAwb) {
                setAwbType(foundAwb.awbType || "");
              }
            }}
            className="rounded-full py-2 px-4 text-[#3F6592] flex-1 text-sm"
          >
            <option value="" disabled hidden>
              -- Sélectionner un numéro LTA --
            </option>
            {availableAwbs.map((a) => (
              <option key={a._id} value={a.number}>
                {a.number} ({a.awbType || "Type inconnu"})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-4 text-sm mb-4">
        <label>
          <input
            type="radio"
            name="awbType"
            value="Paper AWB"
            checked={awbType === "Paper AWB"}
            onChange={(e) => setAwbType(e.target.value)}
          />
          LTA papier
        </label>
        <label>
          <input
            type="radio"
            name="awbType"
            value="EAP"
            checked={awbType === "EAP"}
            onChange={(e) => setAwbType(e.target.value)}
          />
          EAP
        </label>
        <label>
          <input
            type="radio"
            name="awbType"
            value="EAW"
            checked={awbType === "EAW"}
            onChange={(e) => setAwbType(e.target.value)}
          />
          EAW
        </label>
      </div>

      <textarea
        className="rounded-lg w-full p-2 text-[#3F6592] text-sm"
        placeholder="Ajouter un commentaire ou une référence à cette demande"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      ></textarea>
    </>
  )}


</div>





            </div>

          </div>

        </div>
        
      </main>
      {toast.show && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={() => setToast({ ...toast, show: false })}
  />
)}

    </div>
    
  );
}
