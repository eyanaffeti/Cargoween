import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Transitaire from "@/models/Transitaire";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    await connectToDatabase();

    // Vérifier si l'utilisateur existe
    const user = await Transitaire.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ message: "Utilisateur non trouvé" }), { status: 404 });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ message: "Mot de passe incorrect" }), { status: 401 });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Réponse avec le token
    return new Response(
      JSON.stringify({ message: "Connexion réussie", token }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Erreur serveur :", error);
    return new Response(
      JSON.stringify({ message: "Erreur serveur", error: error.message }),
      { status: 500 }
    );
  }
}
