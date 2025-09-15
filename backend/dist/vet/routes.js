"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const types_1 = require("./types");
const router = (0, express_1.Router)();
// small helper for consistent 500s
function toMsg(err) {
    return err instanceof Error ? err.message : "unexpected error";
}
/* ------------ Vet CRUD (ADMIN for write, any auth for read) ------------ */
// List vets (any authenticated user)
router.get("/", auth_1.requireAuth, async (_req, res) => {
    try {
        const vets = await prisma_1.prisma.vet.findMany({
            where: { archived: false },
            orderBy: { createdAt: "desc" },
            select: {
                id: true, name: true, specialization: true, email: true, phone: true,
                archived: true, createdAt: true, updatedAt: true
            }
        });
        res.json({ ok: true, vets });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: toMsg(err) });
    }
});
// Create vet (ADMIN)
router.post("/", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const parsed = types_1.CreateVetSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ ok: false, error: parsed.error.issues });
    try {
        const vet = await prisma_1.prisma.vet.create({
            data: parsed.data,
            select: {
                id: true, name: true, specialization: true, email: true, phone: true,
                archived: true, createdAt: true
            }
        });
        res.status(201).json({ ok: true, vet });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: toMsg(err) });
    }
});
// Get vet by id (any authenticated)
router.get("/:vetId", auth_1.requireAuth, async (req, res) => {
    const { vetId } = req.params;
    try {
        const vet = await prisma_1.prisma.vet.findUnique({
            where: { id: vetId },
            select: {
                id: true, name: true, specialization: true, email: true, phone: true,
                archived: true, createdAt: true, updatedAt: true
            }
        });
        if (!vet)
            return res.status(404).json({ ok: false, error: "Not found" });
        res.json({ ok: true, vet });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: toMsg(err) });
    }
});
// Update vet (ADMIN)
router.patch("/:vetId", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const { vetId } = req.params;
    const parsed = types_1.UpdateVetSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ ok: false, error: parsed.error.issues });
    try {
        const vet = await prisma_1.prisma.vet.update({
            where: { id: vetId },
            data: parsed.data,
            select: {
                id: true, name: true, specialization: true, email: true, phone: true,
                archived: true, updatedAt: true
            }
        });
        res.json({ ok: true, vet });
    }
    catch (err) {
        // if record not found, Prisma throws
        res.status(404).json({ ok: false, error: "Not found" });
    }
});
// Archive vet (ADMIN)
router.delete("/:vetId", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const { vetId } = req.params;
    try {
        const vet = await prisma_1.prisma.vet.update({
            where: { id: vetId },
            data: { archived: true },
            select: { id: true, archived: true, updatedAt: true }
        });
        res.json({ ok: true, vet });
    }
    catch (err) {
        res.status(404).json({ ok: false, error: "Not found" });
    }
});
/* ------------ Availability (ADMIN create/manage; all can view) ------------ */
// List upcoming availability slots for a vet (any authenticated)
router.get("/:vetId/availability", auth_1.requireAuth, async (req, res) => {
    const { vetId } = req.params;
    try {
        const slots = await prisma_1.prisma.availability.findMany({
            where: { vetId, startAt: { gte: new Date() }, isBooked: false },
            orderBy: { startAt: "asc" },
            select: { id: true, startAt: true, endAt: true, isBooked: true, createdAt: true }
        });
        res.json({ ok: true, slots });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: toMsg(err) });
    }
});
// Create a slot (ADMIN)
router.post("/:vetId/availability", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const { vetId } = req.params;
    const parsed = types_1.CreateAvailabilitySchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ ok: false, error: parsed.error.issues });
    try {
        const vet = await prisma_1.prisma.vet.findUnique({ where: { id: vetId }, select: { id: true } });
        if (!vet)
            return res.status(404).json({ ok: false, error: "Vet not found" });
        const { startAt, endAt } = parsed.data;
        // time overlap check
        const overlapping = await prisma_1.prisma.availability.findFirst({
            where: {
                vetId,
                OR: [{ startAt: { lt: endAt }, endAt: { gt: startAt } }]
            }
        });
        if (overlapping)
            return res.status(409).json({ ok: false, error: "Slot overlaps existing availability" });
        const slot = await prisma_1.prisma.availability.create({
            data: { vetId, startAt, endAt },
            select: { id: true, startAt: true, endAt: true, isBooked: true, createdAt: true }
        });
        res.status(201).json({ ok: true, slot });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: toMsg(err) });
    }
});
// Update a slot (ADMIN)
router.patch("/:vetId/availability/:slotId", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const { vetId, slotId } = req.params;
    const parsed = types_1.UpdateAvailabilitySchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ ok: false, error: parsed.error.issues });
    try {
        // If start/end change, verify no overlap
        if (parsed.data.startAt || parsed.data.endAt) {
            const current = await prisma_1.prisma.availability.findUnique({ where: { id: slotId } });
            if (!current || current.vetId !== vetId)
                return res.status(404).json({ ok: false, error: "Slot not found" });
            const startAt = parsed.data.startAt ?? current.startAt;
            const endAt = parsed.data.endAt ?? current.endAt;
            const overlapping = await prisma_1.prisma.availability.findFirst({
                where: {
                    vetId,
                    id: { not: slotId },
                    OR: [{ startAt: { lt: endAt }, endAt: { gt: startAt } }]
                }
            });
            if (overlapping)
                return res.status(409).json({ ok: false, error: "Updated slot overlaps another availability" });
        }
        const slot = await prisma_1.prisma.availability.update({
            where: { id: slotId },
            data: parsed.data,
            select: { id: true, startAt: true, endAt: true, isBooked: true, updatedAt: true }
        });
        res.json({ ok: true, slot });
    }
    catch (err) {
        res.status(404).json({ ok: false, error: "Slot not found" });
    }
});
// Delete a slot (ADMIN)
router.delete("/:vetId/availability/:slotId", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const { vetId, slotId } = req.params;
    try {
        const current = await prisma_1.prisma.availability.findUnique({ where: { id: slotId } });
        if (!current || current.vetId !== vetId)
            return res.status(404).json({ ok: false, error: "Slot not found" });
        await prisma_1.prisma.availability.delete({ where: { id: slotId } });
        res.json({ ok: true, deleted: true });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: toMsg(err) });
    }
});
exports.default = router;
