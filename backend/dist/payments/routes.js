"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const msg = (e) => (e instanceof Error ? e.message : "unexpected error");
const MockResultSchema = zod_1.z.object({
    result: zod_1.z.enum(["SUCCESS", "FAILED"]),
});
// ------------------------------
// Get payment for an appointment (owner/admin)
// GET /payments/:appointmentId
// ------------------------------
router.get("/:appointmentId", auth_1.requireAuth, async (req, res) => {
    try {
        const appt = await prisma_1.prisma.appointment.findUnique({
            where: { id: req.params.appointmentId },
            select: {
                id: true,
                ownerId: true,
                payment: {
                    select: {
                        status: true,
                        amountCents: true,
                        reference: true,
                        provider: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!appt)
            return res.status(404).json({ ok: false, error: "Appointment not found" });
        const isOwner = appt.ownerId === req.user.id;
        const isAdmin = req.user.role === "ADMIN";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ ok: false, error: "Forbidden" });
        }
        res.json({ ok: true, payment: appt.payment ?? null });
    }
    catch (e) {
        res.status(500).json({ ok: false, error: msg(e) });
    }
});
// ------------------------------
// Mock payment result (ADMIN)
// POST /payments/:appointmentId/mock
// Body: { "result": "SUCCESS" | "FAILED" }
// ------------------------------
router.post("/:appointmentId/mock", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const parsed = MockResultSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ ok: false, error: parsed.error.issues });
    }
    try {
        const appt = await prisma_1.prisma.appointment.findUnique({
            where: { id: req.params.appointmentId },
            select: { id: true },
        });
        if (!appt)
            return res.status(404).json({ ok: false, error: "Appointment not found" });
        let payment = await prisma_1.prisma.payment.findUnique({
            where: { appointmentId: appt.id },
        });
        // If no payment exists, create one with PENDING + provider
        if (!payment) {
            payment = await prisma_1.prisma.payment.create({
                data: {
                    appointmentId: appt.id,
                    amountCents: 3500,
                    status: "PENDING",
                    provider: "MOCK",
                },
            });
        }
        const reference = parsed.data.result === "SUCCESS"
            ? `MOCK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
            : null;
        const updated = await prisma_1.prisma.payment.update({
            where: { appointmentId: appt.id },
            data: {
                status: parsed.data.result,
                reference: reference ?? undefined,
            },
            select: {
                status: true,
                reference: true,
                amountCents: true,
                provider: true,
                createdAt: true,
            },
        });
        res.json({ ok: true, payment: updated });
    }
    catch (e) {
        res.status(500).json({ ok: false, error: msg(e) });
    }
});
exports.default = router;
