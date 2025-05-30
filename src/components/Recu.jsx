// components/Recu.jsx
import React from "react";

export default function Recu({ data }) {
  return (
    <div id="recu" className="p-10 w-[800px] bg-white text-black text-sm leading-6">
      {/* Logo + Contact */}
      <div className="flex justify-between items-start mb-6">
        <img src="/logodark.png" alt="CargoWeen Logo" className="h-20" />
        <div className="text-right text-xs">
          <p><strong>CargoWeen.com</strong></p>
          <p>Contact@cargoween.com</p>
          <p>+216 20 20 20 20</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Reçu</h2>

      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        <p><strong>Nom</strong></p>
        <p className="font-semibold uppercase">{data.nom}</p>

        <p><strong>Numéro de vol</strong></p>
        <p className="font-bold">{data.flightNumber}</p>

        <p><strong>Aéroport de départ</strong></p>
        <p className="font-bold uppercase">{data.from}</p>

        <p><strong>Aéroport d'arrivée</strong></p>
        <p className="font-bold uppercase">{data.to}</p>

        <p><strong>Mode de Paiement</strong></p>
        <p className="font-bold uppercase">{data.paymentMethod}</p>

        <p><strong>Tarif</strong></p>
        <p>{data.tarif} TND</p>

        <p><strong>Taxes</strong></p>
        <p>{data.taxes}</p>

        <p><strong>Autres frais</strong></p>
        <p>{data.frais}</p>

        <p><strong>Total</strong></p>
        <p className="font-bold text-lg">{data.total} TND</p>

        <p><strong>Nom compagnie aérienne</strong></p>
        <p>{data.compagnie}</p>

        <p><strong>Transitaire</strong></p>
        <p>{data.transitaire}</p>

        <p><strong>Numéro LTA</strong></p>
        <p>{data.awb}</p>

        <p><strong>Restrictions</strong></p>
        <p>{data.restrictions}</p>

        <p><strong>Calcul tarifaire</strong></p>
        <p>{data.calculTarif}</p>
      </div>

      <div className="mt-6 border-t pt-2 text-xs text-gray-600">
        Ce document est généré automatiquement par CargoWeen.
      </div>
    </div>
  );
}
