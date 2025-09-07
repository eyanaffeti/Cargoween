// components/FlightDetailsModal.jsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "./Toast";

export default function FlightDetailsModal({ flight, onClose }) {
  const router = useRouter(); 
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  if (!flight) return null;

  // ✅ Gérer logo, code et nom dynamiquement
  const airlineCode = typeof flight.airline === "string" ? flight.airline : flight.airline?.code;
  const airlineName = typeof flight.airline === "string" ? "" : flight.airline?.name;
  const airlineLogo = typeof flight.airline === "string"
    ? `https://images.kiwi.com/airlines/64/${flight.airline}.png`
    : flight.airline?.logo || "/fallback-logo.png";

  const segment = flight.segments?.[0];

  const formatTime = (datetime) =>
    new Date(datetime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const calcDuration = (departure, arrival) => {
    const start = new Date(departure);
    const end = new Date(arrival);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h${minutes.toString().padStart(2, "0")}`;
  };

  const handleReservation = async () => {
    try {
      const isValid = flight.cargoData.items.every(item => item.nature && item.nature.trim() !== "");
      if (!isValid) {
        setToast({ show: true, message: "Veuillez renseigner la nature de chaque marchandise.", type: "error" });
        return;
      }

      // 1. Sauvegarder marchandise
      const marchandiseRes = await fetch("/api/marchandise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...flight.cargoData,
          user: flight.userId,
        }),
      });
      const marchandise = await marchandiseRes.json();
      if (!marchandiseRes.ok) throw new Error("Erreur création marchandise");

      // 2. Sauvegarder réservation
      const reservationRes = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: flight.userId,
          marchandise: marchandise._id,
          airline: airlineCode, // ✅ toujours le code (BJ, TU, 7A…)
          flightNumber: flight.flightNumber,
          from: flight.from,
          to: flight.to,
          departureDate: segment?.departure?.at,
          arrivalDate: segment?.arrival?.at,
          tarif: flight.tarif,
          totalWeight: flight.totalWeight,
          totalPrice: flight.tarif * flight.totalWeight
        }),
      });
      const reservation = await reservationRes.json();
      if (!reservationRes.ok) throw new Error("Erreur création réservation");

      router.push(`/Transitaire/Reservation/${reservation._id}`);
    } catch (error) {
      console.error(error);
      setToast({ show: true, message: "❌ Vérifiez vos données !", type: "error" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 relative font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-gray-500 hover:text-red-500 text-2xl font-bold"
        >
          ×
        </button>

        {/* Logo et Nom de la compagnie */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-[#1E3A8A] flex items-center justify-center gap-2">
            <span>✈️</span> Détails du vol
          </h2>
          <img
            src={airlineLogo}
            alt={airlineName || airlineCode}
            className="w-20 h-20 mx-auto mb-2 object-contain"
            onError={(e) => { e.target.onerror = null; e.target.src = "/fallback-logo.png"; }}
          />
          <h3 className="text-xl font-bold text-[#1E3A8A]">
            {airlineCode} – {airlineName} <br></br>{flight.flightNumber}
          </h3>
          <p className="text-sm text-gray-600">{segment?.departure.iataCode} → {segment?.arrival.iataCode}</p>
          <p className="text-green-600 font-semibold text-sm mt-1">Départ à l'heure</p>
        </div>

        {/* Bloc horaire */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-sm text-gray-500">Départ</p>
              <p className="text-2xl font-bold text-[#1E3A8A]">{formatTime(segment?.departure.at)}</p>
              <p className="text-xs">{segment?.departure.iataCode} – Terminal {segment?.departure.terminal}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Durée</p>
              <p className="text-lg font-semibold text-gray-800">
                {calcDuration(segment?.departure.at, segment?.arrival.at)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Arrivée</p>
              <p className="text-2xl font-bold text-[#1E3A8A]">{formatTime(segment?.arrival.at)}</p>
              <p className="text-xs">{segment?.arrival.iataCode} – Terminal {segment?.arrival.terminal}</p>
            </div>
          </div>
        </div>

        {/* Détails cargo */}
        <div className="mt-4 text-sm text-gray-700 space-y-1">
          <p>📦 Restrictions : Température ambiante, max 300 kg</p>
          <p>💰 Tarif Fret : <strong>{flight.tarif ? flight.tarif.toFixed(2) : "N/A"} €/kg</strong></p>
        </div>

        {/* Bouton Réservation */}
        <div className="text-center mt-6">
          <button
            onClick={handleReservation}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-full shadow"
          >
            Réserver ce vol
          </button>
        </div>

        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </div>
    </div>
  );
}
