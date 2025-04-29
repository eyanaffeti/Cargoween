// src/app/api/reservation/[id]/awb/route.js

import { connectToDatabase } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export const PATCH = async (request, { params }) => {
  await connectToDatabase();

  try {
    const { id } = params;
    const body = await request.json();
    const { awb } = body;

    const updated = await Reservation.findByIdAndUpdate(id, { awb }, { new: true });
    if (!updated) {
      return new Response(JSON.stringify({ message: "Réservation non trouvée" }), { status: 404 });
    }

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
};
