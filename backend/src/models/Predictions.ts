import mongoose from "mongoose"

const PredictionSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    device_id: { type: String, required: true },
    Platform: { type: String, required: true },
    timestamp: { type: String, required: true },
    label: { type: String, required: true },
    confidence_percent: { type: Number, required: true },
    all_class_probabilities: {
        type: Object,
        required: true,
        default: {},
        properties: {
            Normal: { type: Number, required: true },
            "Heart Attack": { type: Number, required: true },
        }
    },
    value: { type: [Number], required: true }
});

export default mongoose.model("Prediction", PredictionSchema, "processed_predictions");