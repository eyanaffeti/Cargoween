// src/app/api/awb/route.js
import { connectToDatabase } from "@/lib/mongodb";
import AWBStock from "@/models/Stockawb";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

// GET: renvoyer uniquement les AWB de l'utilisateur connecté
export async function GET(req) {
  await connectToDatabase();

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const awbs = await AWBStock.find({ addedBy: decoded.id });
    return NextResponse.json(awbs, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/awb :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// POST: ajouter un AWB avec l’utilisateur connecté
export async function POST(req) {
  await connectToDatabase();
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const body = await req.json();
    const awb = await AWBStock.create({
      ...body,
      addedBy: decoded.id, // ✅ on enregistre l’utilisateur
    });

    return NextResponse.json(awb, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/awb :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE: supprimer un AWB (optionnel: vérifier que c’est bien le créateur)
export async function DELETE(req, { params }) {
  await connectToDatabase();
  const { id } = params;

  try {
    const deleted = await AWBStock.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "AWB non trouvé." }, { status: 404 });
    }
    return NextResponse.json({ message: "AWB supprimé avec succès." }, { status: 200 });
  } catch (error) {
    console.error("Erreur DELETE /api/awb :", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}
