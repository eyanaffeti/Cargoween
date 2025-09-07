import Offre from "@/models/Offre";
import { connectToDatabase } from "@/lib/mongodb";

// ============================
//  ➡️ POST /api/offres
// ============================
export async function POST(request) {
  await connectToDatabase();
  try {
    const body = await request.json();

    // ❌ Ne pas générer de tags ici
    const offre = await Offre.create({
      ...body,
    });

    return new Response(JSON.stringify(offre), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}

// ============================
//  ➡️ GET /api/offres
// ============================
export async function GET(req) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const airlineId = searchParams.get("airline");

    let query = {};
    if (airlineId) {
      query.airline = airlineId; // ✅ filtre par compagnie connectée
    }

    const offres = await Offre.find(query).populate("airline", "company firstname lastname");
    return new Response(JSON.stringify(offres), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
