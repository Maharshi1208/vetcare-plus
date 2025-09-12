import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth";
import { CreateApptSchema, RescheduleSchema, StatusSchema } from "./types";

const router = Router();
const msg = (e: unknown) => (e instanceof Error ? e.message : "unexpected error");

// --- Utility: ensure the pet belongs to the logged-in OWNER (ADMIN bypasses) ---
async function assertOwnershipOrAdmin(req: AuthedRequest, petId: string) {
  if (req.user!.role === "ADMIN") return;
  const pet = await prisma.pet.findFirst({
    where: { id: petId, ownerId: req.user!.id },
    select: { id: true },
  });
  if (!pet) throw new Error("Pet not found or not owned by user");
}

// --- Utility: conflict check for a vet around the dateTime (30min window) ---
async function vetConflict(vetId: string, dateTime: Date, ignoreApptId?: string) {
  // treat appointments as 30-minute slots
  const start = new Date(dateTime);
  const end = new Date(dateTime.getTime() + 30 * 60 * 1000);

  const conflict = await prisma.appointment.findFirst({
    where: {
      vetId,
      id: ignoreApptId ? { not: ignoreApptId } : undefined,
      status: { in: ["BOOKED", "COMPLETED"] }, // anything that occupies time
      OR: [
        { dateTime: { gte: start, lt: end } }, // overlaps start..end
        // If you later store explicit end time, switch to a proper range overlap check
      ],
    },
    select: { id: true, dateTime: true },
  });

  if (conflict) throw new Error("Vet already has an appointment in that time window");
}

/**
 * POST /appointments
 * Create appointment (OWNER/Admin)
 */
router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = CreateApptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues });

  const { petId, vetId, dateTime } = parsed.data;

  try {
    await assertOwnershipOrAdmin(req, petId);

    // ensure vet exists
    const vet = await prisma.vet.findUnique({ where: { id: vetId }, select: { id: true } });
    if (!vet) return res.status(404).json({ ok: false, error: "Vet not found" });

    // conflict check
    await vetConflict(vetId, dateTime);

    const appt = await prisma.appointment.create({
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

    res.status(201).json({ ok: true, appointment: appt });
  } catch (e) {
    res.status(400).json({ ok: false, error: msg(e) });
  }
});

/**
 * GET /appointments
 * - OWNER: only their pets
 * - VET: their own schedule (by vetId param or linked if you later link users->vets)
 * - ADMIN: all; optional filters
 *   ?vetId=...&ownerId=...&from=ISO&to=ISO
 */
router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const isAdmin = req.user!.role === "ADMIN";
    const isVet = req.user!.role === "VET";

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
      if (isVet && req.query.vetId) {
        // vet listing by specified vetId
      } else {
        // default OWNER view
        filters.ownerId = req.user!.id;
      }
    }

    const appts = await prisma.appointment.findMany({
      where: filters,
      orderBy: { dateTime: "asc" },
      select: {
        id: true, status: true, dateTime: true,
        pet: { select: { id: true, name: true } },
        vet: { select: { id: true, name: true } },
      },
    });

    res.json({ ok: true, appointments: appts });
  } catch (e) {
    res.status(500).json({ ok: false, error: msg(e) });
  }
});

/**
 * GET /appointments/:id
 * Access: OWNER (their pet), ADMIN
 */
router.get("/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, status: true, dateTime: true,
        pet: { select: { id: true, name: true, ownerId: true } },
        vet: { select: { id: true, name: true } },
        ownerId: true,
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
 * OWNER of the appt or ADMIN
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
 * OWNER of the appt or ADMIN
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

    // conflict check at new time
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
 * ADMIN can set to COMPLETED or BOOKED
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
