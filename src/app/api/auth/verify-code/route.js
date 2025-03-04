import { connectToDatabase } from "@/lib/mongodb";
import Transitaire from "@/models/Transitaire";
import Airline from "@/models/Airline";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, verificationCode } = await req.json();
    await connectToDatabase();

    console.log("📩 Vérification pour l'email :", email);
    console.log("👀 Code reçu du front :", verificationCode);

    // ✅ Chercher l'utilisateur dans `Transitaire` d'abord
    let user = await Transitaire.findOne({ email });

    // ✅ Si l'utilisateur n'est pas un `Transitaire`, on cherche dans `Airlines`
    if (!user) {
      user = await Airline.findOne({ email });
    }

    // ✅ Si toujours pas trouvé, retourner une erreur
    if (!user) {
      console.log("❌ Utilisateur non trouvé !");
      return new Response(JSON.stringify({ message: "Utilisateur non trouvé" }), { status: 404 });
    }

    console.log("📂 Code stocké en base :", user.verificationCode);

    // ✅ Vérifier que le code est bien stocké
    if (!user.verificationCode || !user.verificationCodeExpires) {
      console.log("❌ Aucun code stocké ou code expiré !");
      return new Response(JSON.stringify({ message: "Aucun code trouvé pour cet email" }), { status: 400 });
    }

    // ✅ Vérifier si le code correspond et s'il n'a pas expiré
    if (parseInt(verificationCode) !== user.verificationCode) {
      console.log("❌ Code incorrect ! Attendu :", user.verificationCode, "Reçu :", verificationCode);
      return new Response(JSON.stringify({ message: "Code incorrect" }), { status: 400 });
    }

    if (new Date() > user.verificationCodeExpires) {
      console.log("❌ Code expiré !");
      return new Response(JSON.stringify({ message: "Code expiré" }), { status: 400 });
    }

    // ✅ Mettre l'utilisateur comme vérifié
    const updatedUser = await (user instanceof Transitaire ? Transitaire : Airline).findByIdAndUpdate(user._id, {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      }, { new: true });

    console.log("✅ Utilisateur après vérification :", updatedUser);

    // ✅ Générer un Token JWT après la vérification du code
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, isVerified: true },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("✅ Token généré avec `isVerified` :", token);

    return new Response(
      JSON.stringify({ message: "Code vérifié avec succès", token }),
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    return new Response(
      JSON.stringify({ message: "Erreur serveur", error: error.message }),
      { status: 500 }
    );
  }
}
