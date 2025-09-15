import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();
const msg = (e: unknown) => (e instanceof Error ? e.message : "unexpected error");

// ---- Zod types ----
const CreateApptSchema = z.object({
  petId: z.string().min(1),
  vetId: z.string().min(1),
  dateTime: z.coerce.date(),
});

const RescheduleSchema = z.object({
  newDateTime: z.coerce.date(),
});

const StatusSchema = z.object({
  status: z.enum(["BOOKED", "COMPLETED", "CANCELLED"]),
});

// ---- Helpers ----
async function assertOwnershipOrAdmin(req: AuthedRequest, petId: string) {
  if (req.user!.role === "ADMIN") return;
  const pet = await prisma.pet.findFirst({
    where: { id: petId, ownerId: req.user!.id },
    select: { id: true },
  });
  if (!pet) throw new Error("Pet not found or not owned by user");
}

// simple 30-min conflict window around dateTime
async function vetConflict(vetId: string, dateTime: Date, ignoreApptId?: string) {
  const start = new Date(dateTime);
  const end = new Date(dateTime.getTime() + 30 * 60 * 1000);

  const conflict = await prisma.appointment.findFirst({
    where: {
      vetId,
      id: ignoreApptId ? { not: ignoreApptId } : undefined,
      status: { in: ["BOOKED", "COMPLETED"] },
      OR: [{ dateTime: { gte: start, lt: end } }],
    },
    select: { id: true },
  });
  if (conflict) throw new Error("Vet already has an appointment in that time window");
}

/**
 * POST /appointments
 * Create appointment (OWNER/Admin) + create PENDING payment
 */
router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = CreateApptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues });

  const { petId, vetId, dateTime } = parsed.data;

  try {
    await assertOwnershipOrAdmin(req, petId);

    const vet = await prisma.vet.findUnique({ where: { id: vetId }, select: { id: true } });
    if (!vet) return res.status(404).json({ ok: false, error: "Vet not found" });

    await vetConflict(vetId, dateTime);

    const appt = await prisma.$transaction(async (tx) => {
      const created = await tx.appointment.create({
        data: {
          petId,
          vetId,
          ownerId: req.user!.id,
          dateTime,
          status: "BOOKED",
        },
        select: {
          id: true, status: true, dateTime: true,
          pet: { select: { id: true, name: true } },
          vet: { select: { id: true, name: true } },
          ownerId: true, createdAt: true,
        },
      });

      // mock PENDING payment (flat amount)  
         await tx.payment.create({
         data: {
    appointmentId: created.id,
    amountCents: 3500,
    status: "PENDING",
    // provider missing here before -> add it:
    provider: "mock",
  },
});
      return created;
    });

    res.status(201).json({ ok: true, appointment: appt });
  } catch (e) {
    res.status(400).json({ ok: false, error: msg(e) });
  }
});

/**
 * GET /appointments
 * OWNER: their appointments; ADMIN: all; VET: if you later link users->vets
 * Optional filters: ?vetId=&ownerId=&from=&to=
 */
router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const isAdmin = req.user!.role === "ADMIN";
    const filters: any = {};

    if (req.query.vetId) filters.vetId = String(req.query.vetId);
    if (req.query.ownerId && isAdmin) filters.ownerId = String(req.query.ownerId);
    if (req.query.from || req.query.to) {
      filters.dateTime = {
        gte: req.query.from ? new Date(String(req.query.from)) : undefined,
        lte: req.query.to ? new Date(String(req.query.to)) : undefined,
      };
    }

    if (!isAdmin) {
      filters.ownerId = req.user!.id; // OWNER default
    }

    const appts = await prisma.appointment.findMany({
      where: filters,
      orderBy: { dateTime: "asc" },
      select: {
        id: true, status: true, dateTime: true,
        pet: { select: { id: true, name: true } },
        vet: { select: { id: true, name: true } },
        payment: { select: { status: true, amountCents: true } },
      },
    });

    res.json({ ok: true, appointments: appts });
  } catch (e) {
    res.status(500).json({ ok: false, error: msg(e) });
  }
});

/**
 * GET /appointments/:id
 * OWNER (own appt) or ADMIN
 */
router.get("/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, status: true, dateTime: true, ownerId: true,
        pet: { select: { id: true, name: true, ownerId: true } },
        vet: { select: { id: true, name: true } },
        payment: { select: { status: true, amountCents: true, reference: true, createdAt: true } },
      },
    });
    if (!appt) return res.status(404).json({ ok: false, error: "Not found" });

    const isOwner = appt.ownerId === req.user!.id;
    const isAdmin = req.user!.role === "ADMIN";
    if (!isOwner && !isAdmin) return res.status(403).json({ ok: false, error: "Forbidden" });

    res.json({ ok: true, appointment: appt });
  } catch (e) {
    res.status(500).json({ ok: false, error: msg(e) });
  }
});

/**
 * POST /appointments/:id/cancel
 * OWNER or ADMIN
 */
router.post("/:id/cancel", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      select: { id: true, ownerId: true, status: true },
    });
    if (!appt) return res.status(404).json({ ok: false, error: "Not found" });

    const isOwner = appt.ownerId === req.user!.id;
    const isAdmin = req.user!.role === "ADMIN";
    if (!isOwner && !isAdmin) return res.status(403).json({ ok: false, error: "Forbidden" });
    if (appt.status !== "BOOKED") return res.status(400).json({ ok: false, error: "Only BOOKED can be cancelled" });

    const updated = await prisma.appointment.update({
      where: { id: appt.id },
      data: { status: "CANCELLED" },
      select: { id: true, status: true },
    });

    res.json({ ok: true, appointment: updated });
  } catch (e) {
    res.status(500).json({ ok: false, error: msg(e) });
  }
});

/**
 * POST /appointments/:id/reschedule
 * OWNER or ADMIN
 */
router.post("/:id/reschedule", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = RescheduleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues });

  try {
    const current = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      select: { id: true, ownerId: true, vetId: true, status: true },
    });
    if (!current) return res.status(404).json({ ok: false, error: "Not found" });

    const isOwner = current.ownerId === req.user!.id;
    const isAdmin = req.user!.role === "ADMIN";
    if (!isOwner && !isAdmin) return res.status(403).json({ ok: false, error: "Forbidden" });
    if (current.status !== "BOOKED") return res.status(400).json({ ok: false, error: "Only BOOKED can be rescheduled" });

    await vetConflict(current.vetId, parsed.data.newDateTime, current.id);

    const updated = await prisma.appointment.update({
      where: { id: current.id },
      data: { dateTime: parsed.data.newDateTime },
      select: { id: true, status: true, dateTime: true },
    });

    res.json({ ok: true, appointment: updated });
  } catch (e) {
    res.status(400).json({ ok: false, error: msg(e) });
  }
});

/**
 * PATCH /appointments/:id/status
 * ADMIN can set to COMPLETED / BOOKED
 */
router.patch("/:id/status", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = StatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues });

  try {
    const appt = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
      select: { id: true, status: true },
    });
    res.json({ ok: true, appointment: appt });
  } catch {
    res.status(404).json({ ok: false, error: "Not found" });
  }
});

export default router;

