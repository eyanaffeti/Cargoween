import { connectToDatabase } from "@/lib/mongodb";
import Airline from "@/models/Airline";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function PUT(req) {
  try {
    await connectToDatabase();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const airlineId = decoded.id; // 🔑 récupéré depuis le token

    const body = await req.json();
    const {
      firstname,
      lastname,
      company,
      country,
      city,
      address,
      postalCode,
      companyID,
      function: jobFunction,
      phone,
      email,
      iataAirportCode,
      airlineCode,
      iataCode,
      password,
    } = body;

    const updateData = {
      firstname,
      lastname,
      company,
      country,
      city,
      address,
      postalCode,
      companyID,
      function: jobFunction,
      phone,
      email,
      iataAirportCode,
      airlineCode,
      iataCode,
    };

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updated = await Airline.findByIdAndUpdate(airlineId, updateData, { new: true });

    if (!updated) {
      return NextResponse.json({ message: "Compagnie aérienne non trouvée." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profil mis à jour avec succès",
      airline: updated,
    });

  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}
