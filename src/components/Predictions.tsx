import React, { useEffect, useState } from "react";

interface Prediction {
    _id: string;
    Platform: string;
    timestamp: string;
    label: string;
    confidence_percent: number;
    all_class_probabilities: {
        Normal: number;
        "Heart Attack": number;
    };
    value: number[];
}

const PredictionList: React.FC = () => {
    const [prediction, setPrediction] = useState<Prediction | null>(null);

    useEffect(() => {
        fetch("http://localhost:5000/api/predictions")
            .then((response) => response.json())
            .then((data) => setPrediction(data))
            .catch((error) => console.error("Error fetching prediction:", error));
    }, []);

    return (
        <div>
            <h1>Latest Prediction</h1>
            {prediction ? (
                <ul>
                    <li>
                        Sensor ID: {prediction._id}<br />
                        Values: {prediction.value.join(", ")}<br />
                        Label: {prediction.label}<br />
                        Confidence: {prediction.confidence_percent}%
                    </li>
                </ul>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default PredictionList;
