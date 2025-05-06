import * as express from "express";
import * as cors from "cors";
import mongoose, { mongo } from "mongoose";
import predictionRoutes from "./routes/predictionRoutes";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://picoUser:yourSecurePassword@sensordb.ra7zrgg.mongodb.net/SensorDB?retryWrites=true&w=majority&appName=SensorDB"
  )
  .then(() => {
    console.log("MongoDB connected");
    console.log("Connection state:", mongoose.connection.readyState); // Logs the connection state
    console.log("Connected to database:", mongoose.connection.db.databaseName); // Logs the database name
  })
  .catch((err) => console.log(err));

app.use("/api/predictions", predictionRoutes);

export default app;
