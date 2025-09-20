// src/app/api/awb/available/route.js
import { connectToDatabase } from "@/lib/mongodb";
import Stockawb from "@/models/Stockawb";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  await connectToDatabase();

  try {
    // 🔑 Vérifier le token
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Récupérer uniquement les AWB de cet utilisateur
    const availableAwbs = await Stockawb.find({
      used: false,
      addedBy: decoded.id,
    });

    return NextResponse.json(availableAwbs, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/awb/available :", error);
    return NextResponse.json({ message: "Erreur lors de la récupération" }, { status: 500 });
  }
};
