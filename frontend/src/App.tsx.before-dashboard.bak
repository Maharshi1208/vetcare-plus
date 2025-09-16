import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Home() {
  const { user, logout } = useAuth();
  return (
    <div className="p-6">
      <div className="flex gap-4 items-center">
        <h1 className="text-2xl font-semibold">VetCare+ Dashboard</h1>
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm opacity-80">Hello, {user?.name ?? user?.email}</span>
              <button className="border rounded-lg px-3 py-1" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="underline">Login</Link>
              <Link to="/register" className="underline">Register</Link>
            </>
          )}
        </div>
      </div>
      <p className="mt-4 opacity-80">This is a protected page. You’re seeing it because you’re logged in.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
