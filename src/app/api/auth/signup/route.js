import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import Transitaire from "@/models/Transitaire";

export async function POST(req) {
    try {
      const { email, password, firstname, lastname, company, country, city, address, postalCode, companyID, function: roleFunction, phone, cassNumber } = await req.json();
  
      await connectToDatabase();
  
      const existingUser = await Transitaire.findOne({ email });
      if (existingUser) {
        return new Response(JSON.stringify({ message: "Cet email est déjà utilisé" }), { status: 400 });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newTransitaire = new Transitaire({
        email,
        password: hashedPassword,
        firstname,
        lastname,
        company,
        country,
        city,
        address,
        postalCode,
        companyID,
        function: roleFunction,
        phone,
        cassNumber,
        role: "transitaire",
        
      });
  
      await newTransitaire.save();
  
      return new Response(JSON.stringify({ message: "Inscription réussie !" }), { status: 201 });
    } catch (error) {
      console.error("❌ Erreur serveur :", error); // <-- Ajout du log
      return new Response(JSON.stringify({ message: "Erreur serveur", error: error.message }), { status: 500 });
    }
  }
  