"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mailer_1 = require("../notify/mailer");
const apptBooked_1 = require("../notify/templates/apptBooked");
const router = (0, express_1.Router)();
router.get("/test", async (req, res) => {
    try {
        const to = String(req.query.to || "me@local.test");
        const info = await (0, mailer_1.sendMail)({
            to,
            subject: "VetCare+ test email",
            html: "<p>Hello from VetCare+ mailer 👋</p>",
            text: "Hello from VetCare+ mailer",
        });
        res.json({ ok: true, messageId: info.messageId });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message ?? "sendMail failed" });
    }
});
router.post("/preview", async (req, res) => {
    try {
        const { to, petName, vetName, dateTime } = req.body ?? {};
        if (!to || !petName || !vetName || !dateTime) {
            return res.status(400).json({
                ok: false,
                error: "Missing required fields: to, petName, vetName, dateTime",
            });
        }
        const manageUrl = process.env.APP_BASE_URL
            ? `${process.env.APP_BASE_URL}/appointments`
            : undefined;
        const { subject, html, text } = (0, apptBooked_1.renderApptBooked)({
            petName,
            vetName,
            dateTimeISO: dateTime,
            manageUrl,
        });
        const info = await (0, mailer_1.sendMail)({ to, subject, html, text });
        res.json({ ok: true, messageId: info.messageId });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message ?? "preview failed" });
    }
});
exports.default = router;
