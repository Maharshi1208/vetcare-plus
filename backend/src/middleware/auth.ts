import { Request, Response, NextFunction } from "express";
import { verifyAccess } from "../auth/jwt";

export interface AuthedRequest extends Request {
  user?: { id: string; role: "OWNER"|"VET"|"ADMIN"; email: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const hdr = req.header("Authorization");
  if (!hdr?.startsWith("Bearer ")) return res.status(401).json({ ok:false, error:"Missing token" });
  const token = hdr.slice(7);
  try {
    const payload = verifyAccess(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ ok:false, error:"Invalid token" });
  }
}

export function requireRole(...roles: Array<"OWNER"|"VET"|"ADMIN">) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ ok:false, error:"Unauthenticated" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ ok:false, error:"Forbidden" });
    next();
  };
}
