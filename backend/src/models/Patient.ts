import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  bloodType: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  medicalHistory: { type: [String], default: [] },
  medications: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Patient", PatientSchema); 