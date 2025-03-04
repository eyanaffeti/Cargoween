import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Transitaire from "@/models/Transitaire";
import Airline from "@/models/Airline"; // Import du modèle Airlines
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connectToDatabase();

    // ✅ Vérifier si l'utilisateur existe dans `Transitaire`
    let user = await Transitaire.findOne({ email });

    // ✅ Si l'utilisateur n'est pas trouvé dans `Transitaire`, chercher dans `Airlines`
    if (!user) {
      user = await Airline.findOne({ email });
    }

    // ✅ Si aucun utilisateur n'est trouvé
    if (!user) {
      return new Response(JSON.stringify({ message: "Utilisateur non trouvé" }), { status: 404 });
    }

    // ✅ Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ message: "Mot de passe incorrect" }), { status: 401 });
    }

    // ✅ Vérifier si l'utilisateur est déjà vérifié
    if (user.isVerified) {
      console.log("🔓 Utilisateur déjà vérifié, connexion directe !");
      
      // ✅ Générer un token avec `isVerified`
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, isVerified: true },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return new Response(
        JSON.stringify({ message: "Connexion réussie", token, isVerified: true }),
        { status: 200 }
      );
    }

    // ✅ Générer un code de vérification à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    console.log(`📩 Code généré pour ${email} :`, verificationCode);

    // ✅ Déterminer la collection à mettre à jour (Transitaire ou Airlines)
    const model = user instanceof Transitaire ? Transitaire : Airline;

    // ✅ Stocker le code temporairement dans la base de données
    await model.findByIdAndUpdate(user._id, {
      verificationCode: verificationCode,
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    console.log(`✅ Code enregistré en base pour ${email}`);

    // ✅ Envoyer l'email avec le code de vérification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Support Cargoween" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Vérification de connexion",
      text: `Votre code de vérification est : ${verificationCode}`,
      html: `<p>Votre code de vérification est : <strong>${verificationCode}</strong></p>`,
    });

    return new Response(
      JSON.stringify({ message: "Code de vérification envoyé", email, isVerified: false }),
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
