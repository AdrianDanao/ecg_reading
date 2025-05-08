import { Router, Request, Response } from "express";
import Predictions from "../models/Predictions";

const router = Router();

// Get latest prediction
router.get("/", async (req: Request, res: Response) => {
  try {
    const prediction = await Predictions.findOne().sort({ timestamp: -1 });
    res.json(prediction);
  } catch (error) {
    console.error("Error fetching prediction:", error);
    res.status(500).json({ error: "Failed to fetch prediction" });
  }
});

// Get latest prediction for a specific patient
router.get("/:patientId", async (req: Request<{ patientId: string }>, res: Response) => {
  try {
    const prediction = await Predictions.findOne({ device_id: req.params.patientId })
      .sort({ timestamp: -1 });
    
    if (!prediction) {
      return res.status(404).json({ error: "No predictions found for this patient" });
    }
    
    res.json(prediction);
  } catch (error) {
    console.error("Error fetching patient prediction:", error);
    res.status(500).json({ error: "Failed to fetch patient prediction" });
  }
});

// Create new prediction
router.post("/", async (req: Request, res: Response) => {
  try {
    const newPrediction = new Predictions(req.body);
    const savedPrediction = await newPrediction.save();
    res.status(201).json(savedPrediction);
  } catch (error) {
    console.error("Error saving prediction:", error);
    res.status(500).json({ error: "Failed to save prediction" });
  }
});

export default router;