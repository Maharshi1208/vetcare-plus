import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Routes>
        {/* default -> /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* success page */}
        <Route path="/welcome" element={<Welcome />} />

        {/* fallback */}
        <Route path="*" element={<div className="p-6">Not found</div>} />
      </Routes>
    </div>
  );
}
