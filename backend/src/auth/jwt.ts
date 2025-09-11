import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "dev2";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES || "7d";

export function signAccess(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}
export function signRefresh(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, JWT_SECRET) as any;
}
