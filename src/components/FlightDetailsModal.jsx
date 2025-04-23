// components/FlightDetailsModal.jsx
import React from "react";

export default function FlightDetailsModal({ flight, onClose }) {
  if (!flight) return null;

  // ✅ 1. Correction ici : backticks nécessaires pour l'URL dynamique
  const airlineLogo = `https://images.kiwi.com/airlines/64/${flight.airline}.png`;

  const segment = flight.segments?.[0];

  const formatTime = (datetime) =>
    new Date(datetime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  // ✅ 2. Correction ici : utiliser des backticks pour `calcDuration`
  const calcDuration = (departure, arrival) => {
    const start = new Date(departure);
    const end = new Date(arrival);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h${minutes.toString().padStart(2, "0")}`;
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
            alt={flight.airline}
            className="w-20 h-20 mx-auto mb-2 object-contain"
            onError={(e) => { e.target.onerror = null; e.target.src = "/fallback-logo.png"; }}
          />
          <h3 className="text-xl font-bold text-[#1E3A8A]">
            {flight.airline} {flight.flightNumber}
          </h3>
          <p className="text-sm text-gray-600">{segment?.departure.iataCode} → {segment?.arrival.iataCode}</p>
          <p className="text-green-600 font-semibold text-sm mt-1">Départ à l'heure</p>
        </div>

        {/* Bloc horaire dynamique */}
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
          <p>💰 Tarif Fret : <strong>{flight.tarif?.toFixed(2) || "1.95"} €/kg</strong></p>
        </div>

        {/* Bouton Réservation */}
        <div className="text-center mt-6">
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-full shadow">
            Réserver ce vol
          </button>
        </div>
      </div>
    </div>
  );
}
