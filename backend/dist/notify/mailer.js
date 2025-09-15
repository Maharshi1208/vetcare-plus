"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
let cachedTransport = null;
function createTransport() {
    return nodemailer_1.default.createTransport({
        host: process.env.MAIL_HOST ?? "localhost",
        port: Number(process.env.MAIL_PORT ?? 1025),
        secure: process.env.MAIL_SECURE === "true",
        auth: process.env.MAIL_USER && process.env.MAIL_PASS
            ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
            : undefined,
    });
}
async function sendMail({ to, subject, html, text, from }) {
    if (!cachedTransport)
        cachedTransport = createTransport();
    const info = await cachedTransport.sendMail({
        from: from ?? process.env.MAIL_FROM ?? "VetCare+ <no-reply@vetcare.local>",
        to,
        subject,
        html,
        text,
    });
    return info;
}
