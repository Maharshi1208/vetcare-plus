"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const mailer_1 = require("../notify/mailer");
const apptBooked_1 = require("../notify/templates/apptBooked");
const router = (0, express_1.Router)();
const msg = (e) => (e instanceof Error ? e.message : "unexpected error");
// ---- Zod types ----
const CreateApptSchema = zod_1.z.object({
    petId: zod_1.z.string().min(1),
    vetId: zod_1.z.string().min(1),
    dateTime: zod_1.z.coerce.date(),
});
const RescheduleSchema = zod_1.z.object({
    newDateTime: zod_1.z.coerce.date(),
});
const StatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["BOOKED", "COMPLETED", "CANCELLED"]),
});
// ---- Helpers ----
async function assertOwnershipOrAdmin(req, petId) {
    if (req.user.role === "ADMIN")
        return;
    const pet = await prisma_1.prisma.pet.findFirst({
        where: { id: petId, ownerId: req.user.id },
        select: { id: true },
    });
    if (!pet)
        throw new Error("Pet not found or not owned by user");
}
// simple 30-min conflict window around dateTime
async function vetConflict(vetId, dateTime, ignoreApptId) {
    const start = new Date(dateTime);
    const end = new Date(dateTime.getTime() + 30 * 60 * 1000);
    const conflict = await prisma_1.prisma.appointment.findFirst({
        where: {
            vetId,
            id: ignoreApptId ? { not: ignoreApptId } : undefined,
            status: { in: ["BOOKED", "COMPLETED"] },
            OR: [{ dateTime: { gte: start, lt: end } }],
        },
        select: { id: true },
    });
    if (conflict)
        throw new Error("Vet already has an appointment in that time window");
}
/**
 * POST /appointments
 * Create appointment (OWNER/Admin) + create PENDING payment + send confirmation email
 */
router.post("/", auth_1.requireAuth, async (req, res) => {
    const parsed = CreateApptSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ ok: false, error: parsed.error.issues });
    const { petId, vetId, dateTime } = parsed.data;
    try {
        await assertOwnershipOrAdmin(req, petId);
        const vet = await prisma_1.prisma.vet.findUnique({ where: { id: vetId }, select: { id: true } });
        if (!vet)
            return res.status(404).json({ ok: false, error: "Vet not found" });
        await vetConflict(vetId, dateTime);
        const appt = await prisma_1.prisma.$transaction(async (tx) => {
            const created = await tx.appointment.create({
                data: {
                    petId,
                    vetId,
                    ownerId: req.user.id,
                    dateTime,
                    status: "BOOKED",
                },
                select: {
                    id: true,
                    status: true,
                    dateTime: true,
                    pet: { select: { id: true, name: true } },
                    vet: { select: { id: true, name: true } },
                    owner: { select: { email: true } }, // ⬅️ needed for email
                    ownerId: true,
                    createdAt: true,
                },
            });
            // mock PENDING payment (flat amount)
            await tx.payment.create({
                data: {
                    appointmentId: created.id,
                    amountCents: 3500,
                    status: "PENDING",
                    provider: "MOCK", // keep consistent with schema/other routes
                },
            });
            return created;
        });
        // Fire-and-forget confirmation email if we have an email and status is BOOKED
        if (appt.status === "BOOKED" && appt.owner?.email) {
            const manageUrl = process.env.APP_BASE_URL
                ? `${process.env.APP_BASE_URL}/appointments`
                : undefined;
            const { subject, html, text } = (0, apptBooked_1.renderApptBooked)({
                petName: appt.pet?.name ?? "your pet",
                vetName: appt.vet?.name ?? "our vet",
                dateTimeISO: appt.dateTime.toISOString(),
                manageUrl,
            });
            // don't await; log error if send fails
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            (0, mailer_1.sendMail)({ to: appt.owner.email, subject, html, text }).catch((e) => {
                console.error("Failed to send appointment email:", e?.message || e);
            });
        }
        res.status(201).json({ ok: true, appointment: appt });
    }
    catch (e) {
        res.status(400).json({ ok: false, error: msg(e) });
    }
});
/**
 * GET /appointments
 * OWNER: their appointments; ADMIN: all; VET: if you later link users->vets
 * Optional filters: ?vetId=&ownerId=&from=&to=
 */
router.get("/", auth_1.requireAuth, async (req, res) => {
    try {
        const isAdmin = req.user.role === "ADMIN";
        const filters = {};
        if (req.query.vetId)
            filters.vetId = String(req.query.vetId);
        if (req.query.ownerId && isAdmin)
            filters.ownerId = String(req.query.ownerId);
        if (req.query.from || req.query.to) {
            filters.dateTime = {
                gte: req.query.from ? new Date(String(req.query.from)) : undefined,
                lte: req.query.to ? new Date(String(req.query.to)) : undefined,
            };
        }
        if (!isAdmin) {
            filters.ownerId = req.user.id; // OWNER default
        }
        const appts = await prisma_1.prisma.appointment.findMany({
            where: filters,
            orderBy: { dateTime: "asc" },
            select: {
                id: true,
                status: true,
                dateTime: true,
                pet: { select: { id: true, name: true } },
                vet: { select: { id: true, name: true } },
                payment: { select: { status: true, amountCents: true } },
            },
        });
        res.json({ ok: true, appointments: appts });
    }
    catch (e) {
        res.status(500).json({ ok: false, error: msg(e) });
    }
});
/**
 * GET /appointments/:id
 * OWNER (own appt) or ADMIN
 */
router.get("/:id", auth_1.requireAuth, async (req, res) => {
    try {
        const appt = await prisma_1.prisma.appointment.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                status: true,
                dateTime: true,
                ownerId: true,
                pet: { select: { id: true, name: true, ownerId: true } },
                vet: { select: { id: true, name: true } },
                payment: { select: { status: true, amountCents: true, reference: true, createdAt: true } },
            },
        });
        if (!appt)
            return res.status(404).json({ ok: false, error: "Not found" });
        const isOwner = appt.ownerId === req.user.id;
        const isAdmin = req.user.role === "ADMIN";
        if (!isOwner && !isAdmin)
            return res.status(403).json({ ok: false, error: "Forbidden" });
        res.json({ ok: true, appointment: appt });
    }
    catch (e) {
        res.status(500).json({ ok: false, error: msg(e) });
    }
});
/**
 * POST /appointments/:id/cancel
 * OWNER or ADMIN
 */
router.post("/:id/cancel", auth_1.requireAuth, async (req, res) => {
    try {
        const appt = await prisma_1.prisma.appointment.findUnique({
            where: { id: req.params.id },
            select: { id: true, ownerId: true, status: true },
        });
        if (!appt)
            return res.status(404).json({ ok: false, error: "Not found" });
        const isOwner = appt.ownerId === req.user.id;
        const isAdmin = req.user.role === "ADMIN";
        if (!isOwner && !isAdmin)
            return res.status(403).json({ ok: false, error: "Forbidden" });
        if (appt.status !== "BOOKED")
            return res.status(400).json({ ok: false, error: "Only BOOKED can be cancelled" });
        const updated = await prisma_1.prisma.appointment.update({
            where: { id: appt.id },
            data: { status: "CANCELLED" },
            select: { id: true, status: true },
        });
        res.json({ ok: true, appointment: updated });
    }
    catch (e) {
        res.status(500).json({ ok: false, error: msg(e) });
    }
});
/**
 * POST /appointments/:id/reschedule
 * OWNER or ADMIN
 */
router.post("/:id/reschedule", auth_1.requireAuth, async (req, res) => {
    const parsed = RescheduleSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ ok: false, error: parsed.error.issues });
    try {
        const current = await prisma_1.prisma.appointment.findUnique({
            where: { id: req.params.id },
            select: { id: true, ownerId: true, vetId: true, status: true },
        });
        if (!current)
            return res.status(404).json({ ok: false, error: "Not found" });
        const isOwner = current.ownerId === req.user.id;
        const isAdmin = req.user.role === "ADMIN";
        if (!isOwner && !isAdmin)
            return res.status(403).json({ ok: false, error: "Forbidden" });
        if (current.status !== "BOOKED")
            return res.status(400).json({ ok: false, error: "Only BOOKED can be rescheduled" });
        await vetConflict(current.vetId, parsed.data.newDateTime, current.id);
        const updated = await prisma_1.prisma.appointment.update({
            where: { id: current.id },
            data: { dateTime: parsed.data.newDateTime },
            select: { id: true, status: true, dateTime: true },
        });
        res.json({ ok: true, appointment: updated });
    }
    catch (e) {
        res.status(400).json({ ok: false, error: msg(e) });
    }
});
/**
 * PATCH /appointments/:id/status
 * ADMIN can set to COMPLETED / BOOKED
 */
router.patch("/:id/status", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const parsed = StatusSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ ok: false, error: parsed.error.issues });
    try {
        const appt = await prisma_1.prisma.appointment.update({
            where: { id: req.params.id },
            data: { status: parsed.data.status },
            select: { id: true, status: true },
        });
        res.json({ ok: true, appointment: appt });
    }
    catch {
        res.status(404).json({ ok: false, error: "Not found" });
    }
});
// Manual email trigger for an appointment (ADMIN only)
router.post("/:id/notify", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    try {
        const appt = await prisma_1.prisma.appointment.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                dateTime: true,
                pet: { select: { name: true } },
                vet: { select: { name: true } },
                owner: { select: { email: true } },
            },
        });
        if (!appt)
            return res.status(404).json({ ok: false, error: "Appointment not found" });
        if (!appt.owner?.email)
            return res.status(400).json({ ok: false, error: "Owner email missing" });
        const manageUrl = process.env.APP_BASE_URL
            ? `${process.env.APP_BASE_URL}/appointments`
            : undefined;
        const { subject, html, text } = (0, apptBooked_1.renderApptBooked)({
            petName: appt.pet?.name ?? "your pet",
            vetName: appt.vet?.name ?? "our vet",
            dateTimeISO: appt.dateTime.toISOString(),
            manageUrl,
        });
        const info = await (0, mailer_1.sendMail)({ to: appt.owner.email, subject, html, text });
        res.json({ ok: true, messageId: info.messageId });
    }
    catch (e) {
        res.status(500).json({ ok: false, error: e?.message || "notify failed" });
    }
});
exports.default = router;
