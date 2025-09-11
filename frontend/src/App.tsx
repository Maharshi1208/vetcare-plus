import { useEffect, useState } from "react";

function App() {
  const [ping, setPing] = useState<string>("Loading...");
  const [db, setDb] = useState<string>("(not checked)");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/ping");
        const data = await res.json();
        setPing(JSON.stringify(data, null, 2));
      } catch (e: any) {
        setPing("Error: " + e.message);
      }
    })();
  }, []);

  async function checkDb() {
    setDb("Checking…");
    try {
      const res = await fetch("/api/health/db");
      const text = await res.text();
      if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${text}`);
      setDb(text);
    } catch (e: any) {
      setDb("Error: " + e.message);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, lineHeight: 1.5 }}>
      <h1>VetCare+ Frontend</h1>

      <h2>Ping result</h2>
      <pre>{ping}</pre>

      <h2>DB health</h2>
      <button onClick={checkDb}>Check /health/db</button>
      <pre>{db}</pre>
    </div>
  );
}

export default App;