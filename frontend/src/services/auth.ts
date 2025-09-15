// src/services/auth.ts
import { api } from "./api";

export type LoginInput = { email: string; password: string };
export type RegisterInput = { name?: string; email: string; password: string };

type AuthSuccess = {
  ok: true;
  user: { id: string; email: string; role: string; name?: string };
  tokens: { access: string; refresh?: string };
};

export async function login(input: LoginInput) {
  const r = await api.post<AuthSuccess>("/auth/login", input);
  return r;
}

export async function register(input: RegisterInput) {
  const r = await api.post<AuthSuccess>("/auth/register", input);
  return r;
}

