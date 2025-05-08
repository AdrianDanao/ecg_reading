import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Navbar from "./Navbar"; // Adjust the import path as necessary

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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch("http://localhost:5000/api/predictions")
      .then((response) => response.json())
      .then((data) => setPrediction(data))
      .catch((error) => console.error("Error fetching prediction:", error));
  }, [refreshKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prevKey) => prevKey + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const chartData =
    prediction?.value.map((val, index) => ({
      time: (index / 1000).toFixed(3),
      voltage: val,
    })) || [];

  return (
    <div>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <h1>Latest Prediction</h1>
        {prediction ? (
          <>
            <ul>
              <li>Sensor ID: {prediction._id}</li>
              <li>Label: {prediction.label}</li>
              <li>Confidence: {prediction.confidence_percent.toFixed(1)}%</li>
            </ul>

            <h3>Signal Graph</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis
                  dataKey="time"
                  label={{
                    value: "Time",
                    position: "insideBottomRight",
                    offset: 0,
                  }}
                />
                <YAxis
                  label={{
                    value: "Voltage",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="voltage"
                  stroke="#8884d8"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default PredictionList;
