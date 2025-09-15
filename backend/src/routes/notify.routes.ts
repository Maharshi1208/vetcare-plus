import { Router } from "express";
import { sendMail } from "../notify/mailer";
import { renderApptBooked } from "../notify/templates/apptBooked";
const router = Router();

router.get("/test", async (req, res) => {
  try {
    const to = String(req.query.to || "me@local.test");
    const info = await sendMail({
      to,
      subject: "VetCare+ test email",
      html: "<p>Hello from VetCare+ mailer 👋</p>",
      text: "Hello from VetCare+ mailer",
    });
    res.json({ ok: true, messageId: info.messageId });
  } catch (err: any) {
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

    const { subject, html, text } = renderApptBooked({
      petName,
      vetName,
      dateTimeISO: dateTime,
      manageUrl,
    });

    const info = await sendMail({ to, subject, html, text });
    res.json({ ok: true, messageId: info.messageId });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message ?? "preview failed" });
  }
});

export default router;
