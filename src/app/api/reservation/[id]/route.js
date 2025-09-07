import { connectToDatabase } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
 

export async function GET(req) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  await connectToDatabase();


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
export async function PATCH(req, { params }) {
  await connectToDatabase();

  try {
    const { id } = params;
    const body = await req.json();

    // ✅ Mettre à jour uniquement le champ "etat"
    const updated = await Reservation.findByIdAndUpdate(
      id,
      { etat: body.etat },
      { new: true }
    );

    if (!updated) {
      return new Response(
        JSON.stringify({ message: "Réservation non trouvée" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error("❌ Erreur PATCH réservation:", error);
    return new Response(
      JSON.stringify({ message: "Erreur serveur" }),
      { status: 500 }
    );
  }
}
export async function DELETE(req, context) {
  const { params } = context;
  await connectToDatabase();

  try {
    const deleted = await Reservation.findByIdAndDelete(params.id);

    if (!deleted) {
      return new Response(
        JSON.stringify({ message: "Réservation introuvable" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Réservation supprimée avec succès" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Erreur suppression réservation:", err);
    return new Response(
      JSON.stringify({ message: "Erreur serveur" }),
      { status: 500 }
    );
  }
}