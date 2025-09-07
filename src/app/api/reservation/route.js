import Reservation from "@/models/Reservation";
import Marchandise from "@/models/Marchandise"; 
import Admin from "@/models/Admin"; // ✅ modèle qui contient les infos user (role, etc.)

import { connectToDatabase } from "@/lib/mongodb";


export async function POST(request) {
  await connectToDatabase();
  try {
    const body = await request.json();
    const reservation = await Reservation.create(body);
    return new Response(JSON.stringify(reservation), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
export const GET = async (req) => {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const role = searchParams.get("role");
  const airlineCode = searchParams.get("airlineCode");

  if (!userId || !role) {
    return new Response(JSON.stringify({ message: "userId ou role manquant" }), { status: 400 });
  }

  try {
    let filter = {};

    if (role === "transitaire") {
      // ✅ Comme dans ton ancien code
      filter.user = userId;
    } else if (role === "airline" && airlineCode) {
      // ✅ Filtrer par code compagnie
      filter.airline = airlineCode;
    }

const reservations = await Reservation.find(filter)
      .populate("marchandise")
      .populate("user", "firstname lastname email phone");    return new Response(JSON.stringify(reservations), { status: 200 });
  } catch (err) {
    console.error("❌ Erreur serveur GET /api/reservation :", err);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
};


