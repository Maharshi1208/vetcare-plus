import { RequestHandler } from "express";
import jwt, { Secret } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as Secret;

export const requireAuth: RequestHandler = (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, error: "Unauthorized" });

    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
      sub: string;
      role: "OWNER" | "VET" | "ADMIN";
      email: string;
    };

    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
};

export const requireRole = (role: "OWNER" | "VET" | "ADMIN"): RequestHandler => {
  return (req, res, next) => {
    if (req.user?.role !== role) return res.status(403).json({ ok: false, error: "Forbidden" });
    next();
  };
};
