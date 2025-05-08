import { Router } from "express";
import Predictions from "../models/Predictions";

const router = Router();

router.get("/", async (req, res) => {
    const predictions = await Predictions.findOne().sort({ timestamp: -1 });
    res.json(predictions);
});

router.post("/", async (req, res) => {
    try {
        const newPrediction = new Predictions(req.body);
        const savedPrediction = await newPrediction.save();
        res.json(savedPrediction);
    } catch (error) {
        console.error("Error saving prediction:", error);
        res.status(500).json({ error: "Failed to save prediction" });
    }
});

export default router;