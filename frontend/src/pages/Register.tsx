import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as apiRegister } from "../services/auth";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // simple client-side checks
    if (!form.email.includes("@")) { setError("Enter a valid email"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      const res = await apiRegister({ name: form.name, email: form.email, password: form.password });
      // Store token + user for now (simple local session)
      try {
        localStorage.setItem("vc_token", res.tokens.access);
        localStorage.setItem("vc_user", JSON.stringify(res.user));
      } catch {}
      alert(`Account created for ${res.user.email}`);
      nav("/");
    } catch (e: any) {
      setError(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-900 text-gray-100 p-6">
      <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-6 shadow">
        <h1 className="text-2xl font-semibold mb-2">Create account</h1>
        <p className="text-sm text-gray-300 mb-6">Join VetCare+ to manage your pet clinic workflow.</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded-lg border border-gray-600 bg-gray-900 p-2"
            placeholder="Name"
            name="name"
            value={form.name}
            onChange={onChange}
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          <input
            className="w-full rounded-lg border border-gray-600 bg-gray-900 p-2"
            placeholder="Confirm Password"
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={onChange}
            autoComplete="new-password"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Continue"}
          </button>
        </form>

        <p className="text-sm mt-4">Already have an account? <Link to="/login" className="underline">Sign in</Link></p>
      </div>
    </div>
  );
}
