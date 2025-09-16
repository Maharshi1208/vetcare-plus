// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Keep your app's roles in one place
export type Role = "OWNER" | "VET" | "ADMIN";

type JWTPayload = { id: string; role: Role; email: string };

// Augment Express Request so req.user is typed everywhere
declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; role: Role; email: string };
  }
}

// Secrets (fallback to ACCESS_TOKEN_SECRET or a dev string)
const JWT_SECRET =
  process.env.ACCESS_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  "dev_access_token_secret_change_me";

// Auth: verifies Bearer token and attaches req.user
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
}

// Role guard: only allow if user’s role is in the required list
export function requireRole(required: Role | Role[]) {
  const allowed = Array.isArray(required) ? required : [required];
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ ok: false, error: "Unauthorized" });
    if (!allowed.includes(role)) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }
    return next();
  };
}
