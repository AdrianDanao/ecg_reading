import React, { useState, useEffect } from "react";
import "./App.css";
import PredictionsList from "./components/Predictions";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prevKey) => prevKey + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <PredictionsList key={refreshKey} />
    </div>
  );
}

export default App;
