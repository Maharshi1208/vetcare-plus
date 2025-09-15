// src/services/api.ts
const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T>(
  path: string,
  { method = "GET", body }: { method?: ApiMethod; body?: any } = {}
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Try JSON, else text
  let data: any = null;
  let raw = "";
  try { data = await res.json(); } catch { try { raw = await res.text(); } catch {} }

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      (raw && raw.trim()) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data ?? (raw as any)) as T;
}

export const api = {
  get:   <T>(p: string) => apiRequest<T>(p, { method: "GET" }),
  post:  <T>(p: string, b?: any) => apiRequest<T>(p, { method: "POST", body: b }),
};
