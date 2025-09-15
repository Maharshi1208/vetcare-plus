"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../lib/prisma");
const types_1 = require("./types");
const jwt_1 = require("./jwt");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/** POST /auth/register */
router.post("/register", async (req, res) => {
    const parsed = types_1.RegisterSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ ok: false, error: parsed.error.issues });
    const { email, password, name, role } = parsed.data;
    const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existing)
        return res.status(409).json({ ok: false, error: "Email already in use" });
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({
        data: { email, passwordHash, name, role: role ?? "OWNER" }
    });
    const access = (0, jwt_1.signAccess)({ id: user.id, role: user.role, email: user.email });
    const refresh = (0, jwt_1.signRefresh)({ id: user.id });
    res.status(201).json({ ok: true, user: { id: user.id, email: user.email, role: user.role, name: user.name }, tokens: { access, refresh } });
});
/** POST /auth/login */
router.post("/login", async (req, res) => {
    const parsed = types_1.LoginSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ ok: false, error: parsed.error.issues });
    const { email, password } = parsed.data;
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ ok: false, error: "Invalid credentials" });
    const ok = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ ok: false, error: "Invalid credentials" });
    const access = (0, jwt_1.signAccess)({ id: user.id, role: user.role, email: user.email });
    const refresh = (0, jwt_1.signRefresh)({ id: user.id });
    res.json({ ok: true, user: { id: user.id, email: user.email, role: user.role, name: user.name }, tokens: { access, refresh } });
});
/** GET /auth/me */
router.get("/me", auth_1.requireAuth, async (req, res) => {
    const me = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, email: true, role: true, name: true } });
    res.json({ ok: true, user: me });
});
exports.default = router;
