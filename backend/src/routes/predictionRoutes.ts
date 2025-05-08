import { Router, Request, Response } from "express";
import Predictions from "../models/Predictions";

const router = Router();

// Get latest prediction
router.get("/", async (req, res) => {
  const { device_id } = req.query;
  try {
    const prediction = await Predictions.findOne({ device_id }).sort({
      timestamp: -1,
    });

    if (!prediction) {
      res.status(404).json({ error: "No predictions found" });
    } else {
      res.json(prediction);
    }
  } catch (error) {
    console.error("Error fetching prediction:", error);
    res.status(500).json({ error: "Failed to fetch prediction" });
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
