import { connectToDatabase } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Marchandise from "@/models/Marchandise";
import Transitaire from "@/models/Transitaire"; 

export async function GET(request, context) {
  await connectToDatabase();
  const { id } = context.params; // ✅ corrigé ici

  try {
    const reservation = await Reservation.findById(id)
      .populate("marchandise")
      .populate("user");

    if (!reservation) {
      return new Response(JSON.stringify({ message: "Réservation non trouvée" }), { status: 404 });
    }

    return new Response(JSON.stringify(reservation), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
