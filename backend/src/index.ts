import * as express from "express";
import mongoose from "mongoose";
import * as cors from "cors";
import * as dotenv from "dotenv";
import patientRoutes from "./routes/patientRoutes";
import predictionRoutes from "./routes/predictionRoutes";

dotenv.config();

console.log("Starting server initialization...");
console.log("Environment variables loaded:", {
  MONGODB_URI: process.env.MONGODB_URI ? "Set (value hidden)" : "Not set",
  PORT: process.env.PORT || 5000
});

const app = express();

// Middleware
console.log("Setting up middleware...");
app.use(cors());  // Allow all origins without credentials
app.use(express.json());

// Connect to MongoDB
console.log("Attempting to connect to MongoDB...");
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/heartguard", {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Routes
console.log("Setting up routes...");
app.use("/api/patients", patientRoutes);
app.use("/api/predictions", predictionRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error occurred:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
}); 