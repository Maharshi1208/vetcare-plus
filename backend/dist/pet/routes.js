"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const types_1 = require("./types");
const router = (0, express_1.Router)();
/**
 * POST /pets
 * Create a pet for the logged-in OWNER (or ADMIN acting as owner with ownerId)
 */
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const parsed = types_1.PetCreateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ ok: false, error: parsed.error.issues });
        }
        const ownerId = req.user.id;
        const { name, species, breed, dob, photoUrl } = parsed.data;
        const pet = await prisma_1.prisma.pet.create({
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
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err?.message || 'create pet error' });
    }
});
/**
 * GET /pets
 * List my pets (non-archived by default; includeArchived=true to show all)
 */
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const ownerId = req.user.id;
        const includeArchived = String(req.query.includeArchived || 'false') === 'true';
        const pets = await prisma_1.prisma.pet.findMany({
            where: { ownerId, ...(includeArchived ? {} : { archived: false }) },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ ok: true, pets });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err?.message || 'list pets error' });
    }
});
/**
 * GET /pets/:id
 * Read one pet (must belong to owner unless ADMIN checks later)
 */
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const ownerId = req.user.id;
        const id = String(req.params.id);
        const pet = await prisma_1.prisma.pet.findFirst({
            where: { id, ownerId },
        });
        if (!pet)
            return res.status(404).json({ ok: false, error: 'Not found' });
        res.json({ ok: true, pet });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err?.message || 'get pet error' });
    }
});
/**
 * PATCH /pets/:id
 * Update fields on my pet
 */
router.patch('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const parsed = types_1.PetUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ ok: false, error: parsed.error.issues });
        }
        const ownerId = req.user.id;
        const id = String(req.params.id);
        const existing = await prisma_1.prisma.pet.findFirst({ where: { id, ownerId } });
        if (!existing)
            return res.status(404).json({ ok: false, error: 'Not found' });
        const data = { ...parsed.data };
        if (data.dob)
            data.dob = new Date(data.dob);
        const pet = await prisma_1.prisma.pet.update({
            where: { id },
            data,
        });
        res.json({ ok: true, pet });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err?.message || 'update pet error' });
    }
});
/**
 * POST /pets/:id/archive
 * POST /pets/:id/restore
 */
router.post('/:id/archive', auth_1.requireAuth, async (req, res) => {
    try {
        const ownerId = req.user.id;
        const id = String(req.params.id);
        const existing = await prisma_1.prisma.pet.findFirst({ where: { id, ownerId } });
        if (!existing)
            return res.status(404).json({ ok: false, error: 'Not found' });
        const pet = await prisma_1.prisma.pet.update({ where: { id }, data: { archived: true } });
        res.json({ ok: true, pet });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err?.message || 'archive pet error' });
    }
});
router.post('/:id/restore', auth_1.requireAuth, async (req, res) => {
    try {
        const ownerId = req.user.id;
        const id = String(req.params.id);
        const existing = await prisma_1.prisma.pet.findFirst({ where: { id, ownerId } });
        if (!existing)
            return res.status(404).json({ ok: false, error: 'Not found' });
        const pet = await prisma_1.prisma.pet.update({ where: { id }, data: { archived: false } });
        res.json({ ok: true, pet });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err?.message || 'restore pet error' });
    }
});
exports.default = router;
