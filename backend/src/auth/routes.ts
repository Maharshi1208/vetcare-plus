import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { RegisterSchema, LoginSchema } from "./types";
import { signAccess, signRefresh } from "./jwt";
import { requireAuth } from "../middleware/auth";

const router = Router();

/** POST /auth/register */
router.post("/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok:false, error: parsed.error.issues });

  const { email, password, name, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ ok:false, error:"Email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, role: role ?? "OWNER" }
  });

  const access = signAccess({ id: user.id, role: user.role, email: user.email });
  const refresh = signRefresh({ id: user.id });

  res.status(201).json({ ok:true, user: { id:user.id, email:user.email, role:user.role, name:user.name }, tokens: { access, refresh } });
});

/** POST /auth/login */
router.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok:false, error: parsed.error.issues });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ ok:false, error:"Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ ok:false, error:"Invalid credentials" });

  const access = signAccess({ id: user.id, role: user.role, email: user.email });
  const refresh = signRefresh({ id: user.id });

  res.json({ ok:true, user: { id:user.id, email:user.email, role:user.role, name:user.name }, tokens: { access, refresh } });
});

/** GET /auth/me */
router.get("/me", requireAuth, async (req: any, res) => {
  const me = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id:true, email:true, role:true, name:true }});
  res.json({ ok:true, user: me });
});

export default router;
