import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { z } from "zod";

const router = Router();
const msg = (e: unknown) => (e instanceof Error ? e.message : "unexpected error");

const MockResultSchema = z.object({
  result: z.enum(["SUCCESS", "FAILED"]),
});

// Get payment for an appointment (owner/admin)
router.get("/:appointmentId", requireAuth, async (req, res) => {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: req.params.appointmentId },
      select: {
        id: true,
        ownerId: true,
        payment: { select: { status: true, amountCents: true, reference: true, createdAt: true } },
      },
    });
    if (!appt) return res.status(404).json({ ok: false, error: "Appointment not found" });

    const isOwner = appt.ownerId === req.user!.id;
    const isAdmin = req.user!.role === "ADMIN";
    if (!isOwner && !isAdmin) return res.status(403).json({ ok: false, error: "Forbidden" });

    res.json({ ok: true, payment: appt.payment ?? null });
  } catch (e) {
    res.status(500).json({ ok: false, error: msg(e) });
  }
});

// Mock payment result (ADMIN)
// POST /payments/:appointmentId/mock { "result": "SUCCESS" | "FAILED" }
router.post("/:appointmentId/mock", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = MockResultSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues });

  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: req.params.appointmentId },
      select: { id: true },
    });
    if (!appt) return res.status(404).json({ ok: false, error: "Appointment not found" });

    let payment = await prisma.payment.findUnique({ where: { appointmentId: appt.id } });
    if (!payment) {
      payment = await prisma.payment.create({
        data: { appointmentId: appt.id, amountCents: 3500, status: "PENDING" },
      });
    }

    const reference =
      parsed.data.result === "SUCCESS"
        ? `MOCK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
        : null;

    const updated = await prisma.payment.update({
      where: { appointmentId: appt.id },
      data: { status: parsed.data.result, reference: reference ?? undefined },
      select: { status: true, reference: true, amountCents: true, createdAt: true },
    });

    res.json({ ok: true, payment: updated });
  } catch (e) {
    res.status(500).json({ ok: false, error: msg(e) });
  }
});

export default router;
