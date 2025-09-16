// src/auth/jwt.ts
import jwt from "jsonwebtoken";

type Role = "OWNER" | "VET" | "ADMIN";

export type AccessPayload = { id: string; role: Role; email: string };
export type RefreshPayload = { id: string };

// Read secrets + expiries (keep simple string values like "15m", "7d")
const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET ||
  process.env.JWT_SECRET || // fallback for older envs
  "dev_access_secret_change_me";

const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ||
  process.env.REFRESH_SECRET || // fallback for older envs
  "dev_refresh_secret_change_me";

const JWT_EXPIRES = process.env.JWT_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES || "7d";

// ----- Named exports -----
export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: JWT_EXPIRES });
}

export function signRefreshToken(payload: RefreshPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyAccess(token: string): AccessPayload {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessPayload;
}

export function verifyRefresh(token: string): RefreshPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshPayload;
}
