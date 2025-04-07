import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server"; // 👈 à importer

export async function GET(req) {
  try {
    await connectToDatabase();  // Connexion à la base de données

    // Vérifier si l'administrateur existe déjà
    const existingAdmin = await Admin.findOne({ email: "raouf@gmail.com" });

    if (existingAdmin) {
      return NextResponse.json({ message: "Administrateur déjà existant." }, { status: 200 });
    }

    // Créer un nouvel administrateur
    const hashedPassword = await bcrypt.hash("raouf123", 10);
    const newAdmin = new Admin({
      firstname: "Terres",
      lastname: "Raouf",
      email: "raouf@gmail.com",
      address: "Nabeul dar chaaben,",
      phone: "22540509",
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();

    return NextResponse.json({ message: "Administrateur ajouté avec succès." }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}
