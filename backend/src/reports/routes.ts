import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { z } from "zod";

const router = Router();
const err = (e: unknown) => (e instanceof Error ? e.message : "unexpected error");

// ---------- Zod schemas ----------
const RangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

const DaySchema = z.object({
  date: z.coerce.date(),
  vetId: z.string().optional(),
});

// ---------- /reports/kpi?from=&to= ----------
router.get("/kpi", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = RangeSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues });

  const { from, to } = parsed.data;

  try {
    // Appointments within range
    const whereRange: any = {};
    if (from || to) {
      whereRange.dateTime = {
        gte: from ?? undefined,
        lte: to ?? undefined,
      };
    }

    const [booked, cancelled, payments] = await Promise.all([
      prisma.appointment.count({ where: { ...whereRange, status: "BOOKED" } }),
      prisma.appointment.count({ where: { ...whereRange, status: "CANCELLED" } }),
      prisma.payment.findMany({
        where: {
          appointment: { ...(whereRange.dateTime ? { dateTime: whereRange.dateTime } : {}) },
          status: "SUCCESS",
        },
        select: { amountCents: true },
      }),
    ]);

    // Upcoming vaccinations (next 30 days)
    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingVacc = await prisma.vaccination.count({
      where: { nextDueDate: { gte: now, lte: soon } },
    });

    const revenueCents = payments.reduce((sum, p) => sum + p.amountCents, 0);

    res.json({
      ok: true,
      kpi: {
        timeWindow: { from: from ?? null, to: to ?? null },
        bookings: booked,
        cancellations: cancelled,
        upcomingVaccinations30d: upcomingVacc,
        mockRevenueCents: revenueCents,
      },
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: err(e) });
  }
});

// ---------- /reports/schedule?date=YYYY-MM-DD[&vetId=] ----------
router.get("/schedule", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = DaySchema.safeParse({
    date: req.query.date,
    vetId: req.query.vetId,
  });
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues });

  const { date, vetId } = parsed.data;

  try {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

    const where: any = { dateTime: { gte: start, lte: end } };
    if (vetId) where.vetId = vetId;

    const appts = await prisma.appointment.findMany({
      where,
      orderBy: { dateTime: "asc" },
      select: {
        id: true, status: true, dateTime: true,
        vet: { select: { id: true, name: true } },
        pet: { select: { id: true, name: true } },
        owner: { select: { id: true, email: true, name: true } },
        payment: { select: { status: true, amountCents: true } },
      },
    });

    res.json({ ok: true, schedule: appts });
  } catch (e) {
    res.status(500).json({ ok: false, error: err(e) });
  }
});

// ---------- /reports/export.csv?from=&to= ----------
router.get("/export.csv", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = RangeSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues });

  const { from, to } = parsed.data;

  try {
    const where: any = {};
    if (from || to) {
      where.dateTime = {
        gte: from ?? undefined,
        lte: to ?? undefined,
      };
    }

    const rows = await prisma.appointment.findMany({
      where,
      orderBy: { dateTime: "asc" },
      select: {
        id: true,
        dateTime: true,
        status: true,
        vet: { select: { name: true } },
        pet: { select: { name: true } },
        owner: { select: { email: true } },
        payment: { select: { status: true, amountCents: true, reference: true } },
      },
    });

    // CSV build
    const header = [
      "appointment_id",
      "date_time_iso",
      "status",
      "vet_name",
      "pet_name",
      "owner_email",
      "payment_status",
      "amount_cents",
      "payment_ref",
    ].join(",");

    const lines = rows.map(r =>
      [
        r.id,
        r.dateTime.toISOString(),
        r.status,
        r.vet?.name ?? "",
        r.pet?.name ?? "",
        r.owner?.email ?? "",
        r.payment?.status ?? "",
        r.payment?.amountCents ?? "",
        r.payment?.reference ?? "",
      ]
        .map(v => String(v).replace(/"/g, '""'))
        .map(v => (v.includes(",") ? `"${v}"` : v))
        .join(",")
    );

    const csv = [header, ...lines].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="appointments_export.csv"`);
    res.send(csv);
  } catch (e) {
    res.status(500).json({ ok: false, error: err(e) });
  }
});

export default router;
