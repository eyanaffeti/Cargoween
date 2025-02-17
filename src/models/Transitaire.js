import mongoose from "mongoose";

const TransitaireSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  company: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  postalCode: { type: String, required: true },
  companyID: { type: String, required: true },
  function: { type: String, required: true },
  phone: { type: String, required: true },
  cassNumber: { type: String, required: true },
  role: { type: String, default: "transitaire" }, // Ajout du rôle par défaut
}, { timestamps: true });

const Transitaire = mongoose.models.Transitaire || mongoose.model("Transitaire", TransitaireSchema);

export default Transitaire;
