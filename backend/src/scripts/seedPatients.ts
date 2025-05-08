import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Patient from "../models/Patient";

dotenv.config();

// Log the MongoDB URI (with sensitive parts masked)
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("MONGODB_URI is not defined in .env file");
  process.exit(1);
}

// Mask the password in the URI for logging
const maskedUri = mongoUri.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)(@.+)/, '$1****$3');
console.log("Attempting to connect to MongoDB with URI:", maskedUri);

const samplePatients = [
  {
    name: "John Smith",
    age: 45,
    gender: "Male",
    bloodType: "O+",
    address: "123 Main St",
    contactNumber: "555-0123",
    emergencyContact: "555-0124",
    medicalHistory: ["Hypertension", "Type 2 Diabetes"],
    medications: ["Metformin", "Lisinopril"]
  },
  {
    name: "Sarah Johnson",
    age: 38,
    gender: "Female",
    bloodType: "A+",
    address: "456 Oak Ave",
    contactNumber: "555-0125",
    emergencyContact: "555-0126",
    medicalHistory: ["Asthma"],
    medications: ["Albuterol"]
  },
  {
    name: "Michael Brown",
    age: 52,
    gender: "Male",
    bloodType: "B+",
    address: "789 Pine Rd",
    contactNumber: "555-0127",
    emergencyContact: "555-0128",
    medicalHistory: ["Heart Disease", "High Cholesterol"],
    medications: ["Atorvastatin", "Aspirin"]
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB with options
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log("Successfully connected to MongoDB");

    // Clear existing patients
    console.log("Clearing existing patients...");
    await Patient.deleteMany({});
    console.log("Successfully cleared existing patients");

    // Insert sample patients
    console.log("Inserting sample patients...");
    const insertedPatients = await Patient.insertMany(samplePatients);
    console.log(`Successfully inserted ${insertedPatients.length} patients:`, 
      insertedPatients.map(p => ({ id: p._id, name: p.name })));

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Successfully disconnected from MongoDB");
  } catch (error) {
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

seedDatabase(); 