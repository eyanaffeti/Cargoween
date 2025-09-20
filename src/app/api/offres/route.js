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
// GET /api/offres
export async function GET(req) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const airlineId = searchParams.get("airline");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");

    const query = {};
    if (airlineId) query.airline = airlineId;
    if (from) query.from = from;
    if (to) query.to = to;
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      query.departureDate = { $gte: dayStart, $lte: dayEnd };
    }

    const offres = await Offre.find(query).populate("airline", "company firstname lastname");
    return new Response(JSON.stringify(offres), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}

