import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();
const msg = (e: unknown) => (e instanceof Error ? e.message : "unexpected error");

// ---------- Zod Schemas ----------
const VaccinationCreate = z.object({
  petId: z.string().min(1),
  vaccineName: z.string().min(1),
  givenDate: z.coerce.date(),
  nextDueDate: z.coerce.date().optional(),
  notes: z.string().max(1000).optional(),
});

const MedicationCreate = z.object({
  petId: z.string().min(1),
  name: z.string().min(1),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  notes: z.string().max(1000).optional(),
});

// ---------- Helpers ----------
async function assertPetOwnershipOrElevated(req: AuthedRequest, petId: string) {
  if (req.user!.role === "ADMIN" || req.user!.role === "VET") return;
  const owned = await prisma.pet.findFirst({
    where: { id: petId, ownerId: req.user!.id },
    select: { id: true },
  });
  if (!owned) throw new Error("Pet not found or not owned by user");
}

// ---------- Vaccinations ----------

// VET/ADMIN create vaccination (owners cannot add per spec)
router.post("/vaccinations", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = VaccinationCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues });

  try {
    if (req.user!.role === "OWNER") {
      return res.status(403).json({ ok: false, error: "Only VET/ADMIN can add vaccinations" });
    }
    await assertPetOwnershipOrElevated(req, parsed.data.petId);

    const created = await prisma.vaccination.create({
      data: {
        petId: parsed.data.petId,
        vetId: req.user!.role === "VET" ? req.user!.id : null,
        vaccineName: parsed.data.vaccineName,
        givenDate: parsed.data.givenDate,
        nextDueDate: parsed.data.nextDueDate,
        notes: parsed.data.notes,
      },
      select: {
        id: true,
        vaccineName: true,
        givenDate: true,
        nextDueDate: true,
        notes: true,
        pet: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ ok: true, vaccination: created });
  } catch (e) {
    res.status(400).json({ ok: false, error: msg(e) });
  }
});

// list vaccinations by pet
router.get("/vaccinations", requireAuth, async (req: AuthedRequest, res) => {
  const petId = String(req.query.petId || "");
  if (!petId) return res.status(400).json({ ok: false, error: "petId is required" });

  try {
    await assertPetOwnershipOrElevated(req, petId);

    const list = await prisma.vaccination.findMany({
      where: { petId },
      orderBy: { givenDate: "desc" },
      select: {
        id: true, vaccineName: true, givenDate: true, nextDueDate: true, notes: true,
      },
    });

    res.json({ ok: true, vaccinations: list });
  } catch (e) {
    res.status(400).json({ ok: false, error: msg(e) });
  }
});

// ---------- Medications ----------

// OWNER or VET/ADMIN can add medication
router.post("/medications", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = MedicationCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues });

  try {
    await assertPetOwnershipOrElevated(req, parsed.data.petId);

    const created = await prisma.medication.create({
      data: {
        petId: parsed.data.petId,
        prescribedById: req.user!.role === "VET" ? req.user!.id : null,
        name: parsed.data.name,
        dosage: parsed.data.dosage,
        frequency: parsed.data.frequency,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        notes: parsed.data.notes,
      },
      select: {
        id: true, name: true, dosage: true, frequency: true,
        startDate: true, endDate: true, notes: true,
        pet: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ ok: true, medication: created });
  } catch (e) {
    res.status(400).json({ ok: false, error: msg(e) });
  }
});

// list medications by pet
router.get("/medications", requireAuth, async (req: AuthedRequest, res) => {
  const petId = String(req.query.petId || "");
  if (!petId) return res.status(400).json({ ok: false, error: "petId is required" });

  try {
    await assertPetOwnershipOrElevated(req, petId);

    const list = await prisma.medication.findMany({
      where: { petId },
      orderBy: [{ startDate: "desc" }],
      select: {
        id: true, name: true, dosage: true, frequency: true,
        startDate: true, endDate: true, notes: true,
      },
    });

    res.json({ ok: true, medications: list });
  } catch (e) {
    res.status(400).json({ ok: false, error: msg(e) });
  }
});

// ---------- Combined Pet Health timeline (optional) ----------
router.get("/timeline/:petId", requireAuth, async (req: AuthedRequest, res) => {
  const petId = req.params.petId;

  try {
    await assertPetOwnershipOrElevated(req, petId);

    const [vaccs, meds] = await Promise.all([
      prisma.vaccination.findMany({
        where: { petId },
        select: { id: true, vaccineName: true, givenDate: true, nextDueDate: true, notes: true },
        orderBy: { givenDate: "desc" },
      }),
      prisma.medication.findMany({
        where: { petId },
        select: { id: true, name: true, startDate: true, endDate: true, dosage: true, frequency: true, notes: true },
        orderBy: { startDate: "desc" },
      }),
    ]);

    const timeline = [
      ...vaccs.map(v => ({ type: "VACCINATION", when: v.givenDate, data: v })),
      ...meds.map(m => ({ type: "MEDICATION", when: m.startDate, data: m })),
    ].sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());

    res.json({ ok: true, timeline });
  } catch (e) {
    res.status(400).json({ ok: false, error: msg(e) });
  }
});

export default router;
