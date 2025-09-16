export type LoginInput = { email: string; password: string };
export type RegisterInput = { name: string; email: string; password: string; confirmPassword?: string };

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function postJSON<T>(url: string, body: any, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: JSON.stringify(body),
    credentials: "include", // safe even if backend doesn't set cookies
    ...init,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    let msg = "Request failed";
    try { msg = JSON.parse(txt)?.message ?? msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// Normalize backend responses to { data: { user }, token }
function normalizeAuthResponse(resp: any) {
  const token =
    resp?.token ??
    resp?.tokens?.access ??      // backend returns { tokens: { access, refresh } }
    resp?.data?.token ??
    null;

  const user =
    resp?.user ??
    resp?.data?.user ??
    null;

  if (!token) throw new Error("Token missing in response");
  return { data: { user }, token };
}

export async function login(input: LoginInput) {
  const resp = await postJSON<any>(`${API}/auth/login`, input);
  return normalizeAuthResponse(resp);
}

export async function register(input: RegisterInput) {
  const { confirmPassword, ...payload } = input;
  const resp = await postJSON<any>(`${API}/auth/register`, payload);
  return normalizeAuthResponse(resp);
}