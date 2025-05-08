import * as express from "express";
import mongoose from "mongoose";
import * as cors from "cors";
import * as dotenv from "dotenv";
import patientRoutes from "./routes/patientRoutes";
import predictionRoutes from "./routes/predictionRoutes";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/heartguard")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Routes
app.use("/api/patients", patientRoutes);
app.use("/api/predictions", predictionRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 