import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Use string literals for statuses (avoid enum import issues)
const STATUS = {
  BOOKED: 'BOOKED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

/**
 * GET /reports/owner/summary?windowDays=30
 * Auth: any logged-in user (scoped to ownerId)
 */
router.get('/owner/summary', requireAuth, async (req: any, res: Response) => {
  try {
    const windowDays = Math.max(1, Number(req.query.windowDays ?? 30));
    const now = new Date();
    const to = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);

    const ownerId = req.user.id as string;

    const pets = await prisma.pet.findMany({
      where: { ownerId, archived: false },
      select: { id: true, name: true },
    });
    const petIds = pets.map(p => p.id);

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        ownerId,
        status: STATUS.BOOKED,
        dateTime: { gte: now, lte: to },
      },
      orderBy: { dateTime: 'asc' },
      select: {
        id: true,
        dateTime: true,
        status: true,
        pet: { select: { id: true, name: true } },
        vet: { select: { id: true, name: true } },
      },
    });

    // Use schema-aligned fields: vaccineName, givenDate, nextDueDate
    const dueVaccinations = await prisma.vaccination.findMany({
      where: {
        petId: { in: petIds.length ? petIds : ['__none__'] },
        nextDueDate: { gte: now, lte: to },
      },
      orderBy: { nextDueDate: 'asc' },
      select: {
        id: true,
        vaccineName: true,
        givenDate: true,
        nextDueDate: true,
        pet: { select: { id: true, name: true } },
      },
    });

    // Active medications (no endDate or endDate in future)
    const activeMedications = await prisma.medication.findMany({
      where: {
        petId: { in: petIds.length ? petIds : ['__none__'] },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      orderBy: { startDate: 'desc' },
      select: {
        id: true,
        name: true,
        dosage: true,
        frequency: true,
        startDate: true,
        endDate: true,
        pet: { select: { id: true, name: true } },
      },
    });

    res.json({
      ok: true,
      windowDays,
      counts: {
        pets: pets.length,
        upcomingAppointments: upcomingAppointments.length,
        dueVaccinations: dueVaccinations.length,
        activeMedications: activeMedications.length,
      },
      pets,
      upcomingAppointments,
      dueVaccinations,
      activeMedications,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || 'report error' });
  }
});

/**
 * GET /reports/admin/kpi?from=ISO&to=ISO
 * Auth: ADMIN
 */
router.get('/admin/kpi', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const from = req.query.from ? new Date(String(req.query.from)) : new Date('1970-01-01T00:00:00.000Z');
    const to = req.query.to ? new Date(String(req.query.to)) : new Date('2999-12-31T23:59:59.999Z');

    const whereRange = { dateTime: { gte: from, lte: to } };

    const [booked, completed, cancelled, total, uniqueOwners] = await Promise.all([
      prisma.appointment.count({ where: { ...whereRange, status: STATUS.BOOKED } }),
      prisma.appointment.count({ where: { ...whereRange, status: STATUS.COMPLETED } }),
      prisma.appointment.count({ where: { ...whereRange, status: STATUS.CANCELLED } }),
      prisma.appointment.count({ where: whereRange }),
      prisma.appointment.groupBy({
        by: ['ownerId'],
        where: whereRange,
        _count: { ownerId: true },
      }),
    ]);

    const mockRevenue = completed * 50;

    const byVet = await prisma.appointment.groupBy({
      by: ['vetId'],
      where: whereRange,
      _count: { vetId: true },
      orderBy: { _count: { vetId: 'desc' } },
      take: 5,
    });

    const vetIds = byVet.map(v => v.vetId).filter(Boolean) as string[];
    const vets = vetIds.length
      ? await prisma.vet.findMany({ where: { id: { in: vetIds } }, select: { id: true, name: true } })
      : [];

    const topVets = byVet.map(v => ({
      vetId: v.vetId,
      name: vets.find(x => x.id === v.vetId)?.name ?? 'Unknown Vet',
      count: v._count.vetId,
    }));

    res.json({
      ok: true,
      window: { from, to },
      totals: { total, booked, completed, cancelled, uniqueOwners: uniqueOwners.length },
      mockRevenue,
      topVets,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || 'kpi error' });
  }
});

export default router;
