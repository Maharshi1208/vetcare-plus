import jwt, { Secret } from "jsonwebtoken";
import type { StringValue } from "ms";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as Secret;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as Secret;

const JWT_EXPIRES = (process.env.JWT_EXPIRES || "15m") as StringValue;
const REFRESH_EXPIRES = (process.env.REFRESH_EXPIRES || "7d") as StringValue;

export function signAccess(payload: Record<string, any>) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: JWT_EXPIRES });
}

export function signRefresh(payload: Record<string, any>) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyAccess<T = any>(token: string): T {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as T;
}

export function verifyRefresh<T = any>(token: string): T {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as T;
}
