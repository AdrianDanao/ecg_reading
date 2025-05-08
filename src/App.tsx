import "./App.css";
import React from "react";
import { UserProvider } from "./contexts/UserContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import PredictionsList from "./components/Predictions";
import ProtectedLayout from "./components/ProtectedLayout";

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<PredictionsList />} />
            <Route path="/predictions" element={<PredictionsList />} />
            <Route path="/profile" element={<div>Profile</div>} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
