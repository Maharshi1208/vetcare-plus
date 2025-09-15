import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * Helpers
 */
function isAdmin(user: any) { return user?.role === "ADMIN"; }

// Owner of appointment or admin can act
async function canActOnAppointment(userId: string, apptId: string, admin: boolean) {
  if (admin) return true;
  const appt = await prisma.appointment.findUnique({ where: { id: apptId }, select: { ownerId: true }});
  return appt?.ownerId === userId;
}

/**
 * POST /payments
 * Create a payment for an appointment that does NOT already have one.
 * Enforces one Payment per Appointment (appointmentId is unique).
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { appointmentId, amountCents, provider = "mock" } = req.body as {
      appointmentId: string;
      amountCents: number;
      provider?: string;
    };

    if (!appointmentId || !amountCents) {
      return res.status(400).json({ ok: false, error: "appointmentId and amountCents are required" });
    }

    const allowed = await canActOnAppointment(user.id, appointmentId, isAdmin(user));
    if (!allowed) return res.status(403).json({ ok: false, error: "Forbidden" });

    // ensure appointment exists and doesn’t already have payment
    const existing = await prisma.payment.findUnique({ where: { appointmentId } });
    if (existing) return res.status(409).json({ ok: false, error: "Payment already exists for this appointment" });

    const payment = await prisma.payment.create({
      data: {
        appointmentId,
        amountCents,
        provider,
        status: "PENDING",
      },
      select: {
        id: true, amountCents: true, provider: true, status: true, createdAt: true,
        appointment: {
          select: {
            id: true, dateTime: true, status: true,
            pet: { select: { id: true, name: true }},
            vet: { select: { id: true, name: true }},
            ownerId: true
          }
        }
      }
    });

    return res.status(201).json({ ok: true, payment });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "create payment error" });
  }
});

/**
 * GET /payments
 * Admin: all payments; Owner: only their payments.
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const whereFilter = isAdmin(user) ? {} : { appointment: { ownerId: user.id } };

    const payments = await prisma.payment.findMany({
      where: whereFilter,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, amountCents: true, provider: true, reference: true, status: true, createdAt: true,
        appointment: {
          select: {
            id: true, dateTime: true, status: true,
            pet: { select: { id: true, name: true }},
            vet: { select: { id: true, name: true }},
            ownerId: true
          }
        }
      }
    });

    return res.json({ ok: true, payments });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "list payments error" });
  }
});

/**
 * POST /payments/:id/complete   -> status: SUCCESS
 * POST /payments/:id/fail       -> status: FAILED
 * POST /payments/:id/refund     -> status: REFUNDED (admin only)
 */
router.post("/:id/complete", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const id = req.params.id;

    // Owner of linked appointment or admin
    const pay = await prisma.payment.findUnique({ where: { id }, select: { appointment: { select: { ownerId: true }}}});
    if (!pay) return res.status(404).json({ ok: false, error: "Payment not found" });
    if (!isAdmin(user) && pay.appointment.ownerId !== user.id) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: "SUCCESS", reference: `MOCK-SUCCESS-${Date.now()}` },
      select: { id: true, status: true, reference: true }
    });
    return res.json({ ok: true, payment: updated });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "complete error" });
  }
});

router.post("/:id/fail", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const id = req.params.id;

    const pay = await prisma.payment.findUnique({ where: { id }, select: { appointment: { select: { ownerId: true }}}});
    if (!pay) return res.status(404).json({ ok: false, error: "Payment not found" });
    if (!isAdmin(user) && pay.appointment.ownerId !== user.id) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: "FAILED", reference: `MOCK-FAILED-${Date.now()}` },
      select: { id: true, status: true, reference: true }
    });
    return res.json({ ok: true, payment: updated });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "fail error" });
  }
});

router.post("/:id/refund", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!isAdmin(user)) return res.status(403).json({ ok: false, error: "Admin only" });

    const id = req.params.id;
    const found = await prisma.payment.findUnique({ where: { id }, select: { id: true }});
    if (!found) return res.status(404).json({ ok: false, error: "Payment not found" });

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: "REFUNDED", reference: `MOCK-REFUND-${Date.now()}` },
      select: { id: true, status: true, reference: true }
    });
    return res.json({ ok: true, payment: updated });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "refund error" });
  }
});

export default router;
