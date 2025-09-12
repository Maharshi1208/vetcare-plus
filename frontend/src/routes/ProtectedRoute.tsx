import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { token } = useAuth();
  const loc = useLocation();

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  // Otherwise, render the protected child routes
  return <Outlet />;
}
