import * as dotenv from "dotenv";
import * as express from "express";
import * as cors from "cors";
import mongoose, { mongo } from "mongoose";
import * as cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes";
import patientRoutes from "./routes/patientRoutes";
import predictionRoutes from "./routes/predictionRoutes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // Allow credentials (cookies, authorization headers, etc.) to be sent
  })
);

app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    console.log("Connection state:", mongoose.connection.readyState); // Logs the connection state
    console.log("Connected to database:", mongoose.connection.db.databaseName); // Logs the database name
  })
  .catch((err) => console.log(err));

app.use("/api/predictions", predictionRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/auth", authRoutes);

export default app;
