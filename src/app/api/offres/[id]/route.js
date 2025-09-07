import { connectToDatabase } from "@/lib/mongodb";
import Offre from "@/models/Offre";

// GET /api/offres/:id
export async function GET(req, context) {
  const { params } = await context;
  await connectToDatabase();
  try {
    const offre = await Offre.findById(params.id);
    if (!offre) {
      return new Response(JSON.stringify({ message: "Offre introuvable" }), { status: 404 });
    }
    return new Response(JSON.stringify(offre), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}

// PUT /api/offres/:id
export async function PUT(req, { params }) {
  await connectToDatabase();
  try {
    const body = await req.json();

    const updated = await Offre.findByIdAndUpdate(
      params.id,        // ✅ maintenant ça marche
      body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return new Response(JSON.stringify({ message: "Offre introuvable" }), { status: 404 });
    }

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}


// DELETE /api/offres/:id
export async function DELETE(req, context) {
  const { params } = await context;
  await connectToDatabase();
  try {
    const deleted = await Offre.findByIdAndDelete(params.id);
    if (!deleted) {
      return new Response(JSON.stringify({ message: "Offre introuvable" }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: "Offre supprimée" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
