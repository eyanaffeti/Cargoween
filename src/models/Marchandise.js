import mongoose from "mongoose";

const MarchandiseSchema = new mongoose.Schema({
  pieces: { type: Number, required: true },
  poids: { type: Number, required: true },
  dimensions: [{
    longueur: { type: Number, required: true },
    largeur: { type: Number, required: true },
    hauteur: { type: Number, required: true },
  }],
  stackable: { type: Boolean, default: false },
  turnable: { type: Boolean, default: false },
  temperature: { type: String, default: "Non requis" },
  suiviTemperature: { type: Boolean, default: false },
  conteneurActif: { type: Boolean, default: false },
  typeMarchandise: { type: String, default: "Normale" },
  lithiumBattery: { type: Boolean, default: false },
  diplomatique: { type: Boolean, default: false },
  express: { type: Boolean, default: false },
  screened: { type: Boolean, default: false },

  //  Ajout obligatoire pour relier au Transitaire
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

}, { timestamps: true });

export default mongoose.models.Marchandise || mongoose.model("Marchandise", MarchandiseSchema);
