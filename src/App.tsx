import "./App.css";
import React from "react";
import { UserProvider } from "./contexts/UserContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login/Login";
import Register from "./components/Register";
import PredictionsList from "./components/Predictions";
import ProtectedLayout from "./components/ProtectedLayout";
import Dashboard from './components/Dashboard/Dashboard';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<PredictionsList />} />
            <Route path="/predictions" element={<PredictionsList />} />
            <Route path="/profile" element={<div>Profile</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
