import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

// -----------------
// Helpers
// -----------------
function isAdmin(req: Request) {
  return req.user?.role === "ADMIN";
}
function isOwner(req: Request, ownerId: string) {
  return req.user?.id === ownerId;
}

/**
 * POST /payments
 * Create a mock payment for an appointment (only if none exists).
 * Body: { appointmentId: string, amountCents: number, provider: string }
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { appointmentId, amountCents, provider } = req.body as {
      appointmentId: string;
      amountCents: number;
      provider: string;
    };

    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true, ownerId: true, payment: { select: { id: true } } },
    });
    if (!appt) return res.status(404).json({ ok: false, error: "Appointment not found" });

    if (!isOwner(req, appt.ownerId) && !isAdmin(req)) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    if (appt.payment) {
      return res
        .status(400)
        .json({ ok: false, error: "Payment already exists for this appointment" });
    }

    const payment = await prisma.payment.create({
      data: {
        appointmentId,
        amountCents,
        provider,
        status: "PENDING",
      },
      select: {
        id: true,
        amountCents: true,
        provider: true,
        reference: true,
        status: true,
        createdAt: true,
        appointment: { select: { id: true, ownerId: true } },
      },
    });

    return res.status(201).json({ ok: true, payment });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "error" });
  }
});

/**
 * GET /payments
 * List payments (admin sees all; owner sees own).
 */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const where = isAdmin(req) ? {} : { appointment: { ownerId: req.user!.id } };

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amountCents: true,
        provider: true,
        reference: true,
        status: true,
        createdAt: true,
        appointment: {
          select: {
            id: true,
            dateTime: true,
            status: true,
            ownerId: true,
            pet: { select: { id: true, name: true } },
            vet: { select: { id: true, name: true } },
          },
        },
      },
    });

    return res.json({ ok: true, payments });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "error" });
  }
});

/**
 * POST /payments/:id/complete
 * Transition: PENDING -> SUCCESS
 * Allowed: appointment owner or admin
 */
router.post("/:id/complete", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const p = await prisma.payment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        appointment: { select: { ownerId: true } },
      },
    });
    if (!p) return res.status(404).json({ ok: false, error: "Payment not found" });

    if (!isOwner(req, p.appointment.ownerId) && !isAdmin(req)) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }
    if (p.status !== "PENDING") {
      return res
        .status(400)
        .json({ ok: false, error: `Only PENDING can be completed (current=${p.status})` });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status: "SUCCESS",
        reference: `MOCK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      },
      select: { id: true, status: true, reference: true },
    });

    return res.json({ ok: true, payment: updated });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "error" });
  }
});

/**
 * POST /payments/:id/fail
 * Transition: PENDING -> FAILED
 * Allowed: appointment owner or admin
 */
router.post("/:id/fail", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const p = await prisma.payment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        appointment: { select: { ownerId: true } },
      },
    });
    if (!p) return res.status(404).json({ ok: false, error: "Payment not found" });

    if (!isOwner(req, p.appointment.ownerId) && !isAdmin(req)) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }
    if (p.status !== "PENDING") {
      return res
        .status(400)
        .json({ ok: false, error: `Only PENDING can be failed (current=${p.status})` });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: "FAILED" },
      select: { id: true, status: true },
    });

    return res.json({ ok: true, payment: updated });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "error" });
  }
});

/**
 * POST /payments/:id/refund
 * Transition: SUCCESS -> REFUNDED
 * Allowed: admin only
 */
router.post("/:id/refund", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ ok: false, error: "Admin only" });
    }

    const id = req.params.id;
    const p = await prisma.payment.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!p) return res.status(404).json({ ok: false, error: "Payment not found" });

    if (p.status !== "SUCCESS") {
      return res
        .status(400)
        .json({ ok: false, error: `Only SUCCESS can be refunded (current=${p.status})` });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: "REFUNDED" },
      select: { id: true, status: true },
    });

    return res.json({ ok: true, payment: updated });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "error" });
  }
});

export default router;
