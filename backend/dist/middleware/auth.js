"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const requireAuth = (req, res, next) => {
    try {
        const auth = req.headers.authorization || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
        if (!token)
            return res.status(401).json({ ok: false, error: "Unauthorized" });
        const payload = jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
        req.user = { id: payload.sub, role: payload.role, email: payload.email };
        next();
    }
    catch {
        return res.status(401).json({ ok: false, error: "Unauthorized" });
    }
};
exports.requireAuth = requireAuth;
const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user?.role !== role)
            return res.status(403).json({ ok: false, error: "Forbidden" });
        next();
    };
};
exports.requireRole = requireRole;
