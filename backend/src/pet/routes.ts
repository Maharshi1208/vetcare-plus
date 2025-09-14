import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { PetCreateSchema, PetUpdateSchema } from './types';

const router = Router();

/**
 * POST /pets
 * Create a pet for the logged-in OWNER (or ADMIN acting as owner with ownerId)
 */
router.post('/', requireAuth, async (req: any, res: Response) => {
  try {
    const parsed = PetCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: parsed.error.issues });
    }

    const ownerId = req.user.id as string;
    const { name, species, breed, dob, photoUrl } = parsed.data;

    const pet = await prisma.pet.create({
      data: {
        ownerId,
        name,
        species,
        breed: breed ?? null,
        dob: dob ? new Date(dob) : null,
        photoUrl: photoUrl ?? null,
      },
    });

    res.status(201).json({ ok: true, pet });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || 'create pet error' });
  }
});

/**
 * GET /pets
 * List my pets (non-archived by default; includeArchived=true to show all)
 */
router.get('/', requireAuth, async (req: any, res: Response) => {
  try {
    const ownerId = req.user.id as string;
    const includeArchived = String(req.query.includeArchived || 'false') === 'true';

    const pets = await prisma.pet.findMany({
      where: { ownerId, ...(includeArchived ? {} : { archived: false }) },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ ok: true, pets });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || 'list pets error' });
  }
});

/**
 * GET /pets/:id
 * Read one pet (must belong to owner unless ADMIN checks later)
 */
router.get('/:id', requireAuth, async (req: any, res: Response) => {
  try {
    const ownerId = req.user.id as string;
    const id = String(req.params.id);

    const pet = await prisma.pet.findFirst({
      where: { id, ownerId },
    });

    if (!pet) return res.status(404).json({ ok: false, error: 'Not found' });

    res.json({ ok: true, pet });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || 'get pet error' });
  }
});

/**
 * PATCH /pets/:id
 * Update fields on my pet
 */
router.patch('/:id', requireAuth, async (req: any, res: Response) => {
  try {
    const parsed = PetUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: parsed.error.issues });
    }

    const ownerId = req.user.id as string;
    const id = String(req.params.id);

    const existing = await prisma.pet.findFirst({ where: { id, ownerId } });
    if (!existing) return res.status(404).json({ ok: false, error: 'Not found' });

    const data: any = { ...parsed.data };
    if (data.dob) data.dob = new Date(data.dob);

    const pet = await prisma.pet.update({
      where: { id },
      data,
    });

    res.json({ ok: true, pet });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || 'update pet error' });
  }
});

/**
 * POST /pets/:id/archive
 * POST /pets/:id/restore
 */
router.post('/:id/archive', requireAuth, async (req: any, res: Response) => {
  try {
    const ownerId = req.user.id as string;
    const id = String(req.params.id);

    const existing = await prisma.pet.findFirst({ where: { id, ownerId } });
    if (!existing) return res.status(404).json({ ok: false, error: 'Not found' });

    const pet = await prisma.pet.update({ where: { id }, data: { archived: true } });
    res.json({ ok: true, pet });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || 'archive pet error' });
  }
});

router.post('/:id/restore', requireAuth, async (req: any, res: Response) => {
  try {
    const ownerId = req.user.id as string;
    const id = String(req.params.id);

    const existing = await prisma.pet.findFirst({ where: { id, ownerId } });
    if (!existing) return res.status(404).json({ ok: false, error: 'Not found' });

    const pet = await prisma.pet.update({ where: { id }, data: { archived: false } });
    res.json({ ok: true, pet });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || 'restore pet error' });
  }
});

export default router;
