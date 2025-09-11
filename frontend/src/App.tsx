import { useEffect, useState } from "react";

function App() {
  const [ping, setPing] = useState<{ ok?: boolean; raw: string }>({ raw: "Loading..." });
  const [db, setDb] = useState<{ ok?: boolean; raw: string }>({ raw: "(not checked)" });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/ping");
        const data = await res.json();
        setPing({ ok: true, raw: JSON.stringify(data, null, 2) });
      } catch (e: any) {
        setPing({ ok: false, raw: "Error: " + e.message });
      }
    })();
  }, []);

  async function checkDb() {
    setDb({ raw: "Checking…" });
    try {
      const res = await fetch("/api/health/db");
      const text = await res.text();
      setDb({ ok: res.ok, raw: text });
    } catch (e: any) {
      setDb({ ok: false, raw: "Error: " + e.message });
    }
  }

  const badge = (ok?: boolean) =>
    ok == null ? "bg-gray-500" : ok ? "bg-green-600" : "bg-red-600";

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-4xl font-extrabold text-blue-400 mb-6">VetCare+ Frontend</h1>

      <div className="grid gap-6 max-w-3xl">
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs ${badge(ping.ok)}`}>
              {ping.ok == null ? "…" : ping.ok ? "OK" : "ERROR"}
            </span>
            <h2 className="text-xl font-semibold">Ping result</h2>
          </div>
          <pre className="text-sm text-gray-200 whitespace-pre-wrap">{ping.raw}</pre>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs ${badge(db.ok)}`}>
              {db.ok == null ? "…" : db.ok ? "OK" : "ERROR"}
            </span>
            <h2 className="text-xl font-semibold">DB health</h2>
          </div>
          <button
            onClick={checkDb}
            className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 active:scale-95 transition"
          >
            Check /health/db
          </button>
          <pre className="mt-3 text-sm text-gray-200 whitespace-pre-wrap">{db.raw}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;