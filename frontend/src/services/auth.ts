export type LoginInput = { email: string; password: string };
export type RegisterInput = { name: string; email: string; password: string; confirmPassword?: string };

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

type ApiResponse<T> = { data: T; message?: string; token?: string };

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

export async function login(input: LoginInput) {
  const resp = await postJSON<ApiResponse<{ user: any; token?: string }>>(`${API}/auth/login`, input);
  return resp;
}

export async function register(input: RegisterInput) {
  const resp = await postJSON<ApiResponse<{ user: any; token?: string }>>(`${API}/auth/register`, input);
  return resp;
}
