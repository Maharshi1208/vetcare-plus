import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { signAccessToken, signRefreshToken } from "./jwt";
import { requireAuth } from "../middleware/auth";

// Local helper type (so we can access req.user safely)
type AuthedRequest = Request & {
  user?: { id: string; role: "OWNER" | "VET" | "ADMIN"; email: string };
};

const router = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/** POST /auth/login */
router.post("/login", async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.issues });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true, passwordHash: true },
  });

  if (!user) return res.status(401).json({ ok: false, error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ ok: false, error: "Invalid credentials" });

  const access = signAccessToken({ id: user.id, role: user.role, email: user.email });
  const refresh = signRefreshToken({ id: user.id });

  return res.json({
    ok: true,
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
    tokens: { access, refresh },
  });
});

/** GET /auth/me */
router.get("/me", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    // ensure we actually have a user from the auth middleware
    const id = req.user?.id;
    const email = req.user?.email;

    if (!id && !email) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const me = await prisma.user.findUnique({
      where: id ? { id } : { email: email! },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!me) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    return res.json({ ok: true, user: me });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return res.status(500).json({ ok: false, error: msg });
  }
});

export default router;
