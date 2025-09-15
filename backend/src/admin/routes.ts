import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest, requireAuth, requireRole } from "../middleware/auth";
import { z } from "zod";

const router = Router();
const err = (e: unknown) => (e instanceof Error ? e.message : "unexpected error");

// Zod
const RoleSchema = z.enum(["OWNER", "VET", "ADMIN"]);
const UpdateRoleSchema = z.object({ role: RoleSchema });
const UserIdSchema = z.object({ userId: z.string().min(1) });

// List users (ADMIN)
router.get("/users", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, suspended: true, createdAt: true },
    });
    res.json({ ok: true, users });
  } catch (e) {
    res.status(500).json({ ok: false, error: err(e) });
  }
});

// Suspend user (ADMIN)
router.post("/users/:userId/suspend", requireAuth, requireRole("ADMIN"), async (req: AuthedRequest, res) => {
  const parsed = UserIdSchema.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues });
  const { userId } = parsed.data;

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { suspended: true },
      select: { id: true, email: true, role: true, suspended: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        targetUserId: updated.id,
        action: "SUSPEND_USER",
        details: `Suspended by ${req.user!.email}`,
      },
    });

    res.json({ ok: true, user: updated });
  } catch (e) {
    res.status(400).json({ ok: false, error: err(e) });
  }
});

// Reactivate user (ADMIN)
router.post("/users/:userId/reactivate", requireAuth, requireRole("ADMIN"), async (req: AuthedRequest, res) => {
  const parsed = UserIdSchema.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues });
  const { userId } = parsed.data;

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { suspended: false },
      select: { id: true, email: true, role: true, suspended: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        targetUserId: updated.id,
        action: "REACTIVATE_USER",
        details: `Reactivated by ${req.user!.email}`,
      },
    });

    res.json({ ok: true, user: updated });
  } catch (e) {
    res.status(400).json({ ok: false, error: err(e) });
  }
});

// Change role (ADMIN)
router.post("/users/:userId/role", requireAuth, requireRole("ADMIN"), async (req: AuthedRequest, res) => {
  const idParsed = UserIdSchema.safeParse(req.params);
  if (!idParsed.success) return res.status(400).json({ ok: false, error: idParsed.error.issues });

  const bodyParsed = UpdateRoleSchema.safeParse(req.body);
  if (!bodyParsed.success) return res.status(400).json({ ok: false, error: bodyParsed.error.issues });

  const { userId } = idParsed.data;
  const { role } = bodyParsed.data;

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, role: true, suspended: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        targetUserId: updated.id,
        action: "CHANGE_ROLE",
        details: `Changed role to ${role} by ${req.user!.email}`,
      },
    });

    res.json({ ok: true, user: updated });
  } catch (e) {
    res.status(400).json({ ok: false, error: err(e) });
  }
});

export default router;
