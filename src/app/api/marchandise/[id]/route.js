import { connectToDatabase } from "@/lib/mongodb";
import Marchandise from "@/models/Marchandise";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  await connectToDatabase();

  const { id } = params;

  try {
    const marchandise = await Marchandise.findById(id);
    if (!marchandise) {
      return new Response(JSON.stringify({ message: "Marchandise introuvable" }), { status: 404 });
    }

    return new Response(JSON.stringify(marchandise), { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/marchandise/[id] :", error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
