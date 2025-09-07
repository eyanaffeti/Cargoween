import mongoose from "mongoose";

const offreSchema = new mongoose.Schema({
  airline: { type: mongoose.Schema.Types.ObjectId, ref: "Airline", required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureDate: { type: Date, required: true },
  arrivalDate: { type: Date, required: true },
  flightNumber: { type: String, required: true },
  tarifKg: { type: Number, required: true }, //  Tarif par kg
  iataAirportCode: { type: String, required: true },
  airlineName: { type: String, required: true },
  tags: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.Offre || mongoose.model("Offre", offreSchema);
