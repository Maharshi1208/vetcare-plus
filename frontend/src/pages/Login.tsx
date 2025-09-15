import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as apiLogin } from "../services/auth";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = React.useState({ email: "", password: "" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.email.includes("@")) { setError("Enter a valid email"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    try {
      const res = await apiLogin({ email: form.email, password: form.password });
      try {
        localStorage.setItem("vc_token", res.tokens.access);
        localStorage.setItem("vc_user", JSON.stringify(res.user));
      } catch {}
      alert(`Welcome back, ${res.user.name || res.user.email}`);
      nav("/");
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-900 text-gray-100 p-6">
      <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-6 shadow">
        <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-gray-300 mb-6">Access your VetCare+ dashboard.</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded-lg border border-gray-600 bg-gray-900 p-2"
            placeholder="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
          />
          <input
            className="w-full rounded-lg border border-gray-600 bg-gray-900 p-2"
            placeholder="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            autoComplete="current-password"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm mt-4">No account? <Link to="/register" className="underline">Create one</Link></p>
      </div>
    </div>
  );
}
