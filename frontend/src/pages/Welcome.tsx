import React from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const nav = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("vc_user") || "null");
    } catch {
      return null;
    }
  })();

  function logout() {
    localStorage.removeItem("vc_token");
    localStorage.removeItem("vc_user");
    nav("/login", { replace: true });
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-900 text-gray-100 p-6">
      <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 p-6 shadow">
        <h1 className="text-3xl font-bold mb-2">Welcome 👋</h1>
        <p className="text-sm text-gray-300 mb-6">
          {user?.name ? `Hello, ${user.name}!` : `Signed in as ${user?.email ?? "Unknown user"}.`}
        </p>

        <div className="space-y-2 text-sm">
          <div className="rounded-lg bg-gray-900 p-3 border border-gray-700">
            <div className="opacity-70">User</div>
            <pre className="mt-1 whitespace-pre-wrap">
{JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => nav("/")}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2"
          >
            Go to Home
          </button>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-600 px-4 py-2"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
