import { connectToDatabase } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export const POST = async (req) => {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { paymentRef, status } = body;

    console.log("📦 Webhook reçu :", body);
    console.log("🔍 Recherche de la réservation avec paymentRef :", paymentRef);

    const exists = await Reservation.findOne({ paymentRef });
    console.log("🎯 Trouvée ?", exists ? "OUI" : "NON");

    if (!paymentRef || status !== "completed") {
      return new Response(JSON.stringify({ message: "Webhook ignoré" }), { status: 200 });
    }

    // 💡 Attente avec retry si jamais paymentRef n’est pas encore en base
    let retries = 10;
    let updated = null;

    while (retries > 0) {
      updated = await Reservation.findOneAndUpdate(
        { paymentRef },
        {
          status: "Payée",
          etat: "Acceptée",
        }
      );

      if (updated) break;

      await new Promise((resolve) => setTimeout(resolve, 1000));
      retries--;
    }

    if (!updated) {
      return new Response(JSON.stringify({ message: "Réservation introuvable après retry" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: "Réservation mise à jour ✔" }), {
      status: 200,
    });

  } catch (error) {
    console.error("❌ Erreur webhook Konnect:", error);
    return new Response(JSON.stringify({ message: "Erreur serveur webhook." }), {
      status: 500,
    });
  }
};

// Gère les GET envoyés par Konnect pour tester si le webhook est accessible
export const GET = async () => {
  return new Response("✅ Webhook actif", { status: 200 });
};
