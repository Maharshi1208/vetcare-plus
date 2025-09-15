import nodemailer from "nodemailer";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

let cachedTransport: nodemailer.Transporter | null = null;

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST ?? "localhost",
    port: Number(process.env.MAIL_PORT ?? 1025),
    secure: process.env.MAIL_SECURE === "true",
    auth:
      process.env.MAIL_USER && process.env.MAIL_PASS
        ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
        : undefined,
  });
}

export async function sendMail({ to, subject, html, text, from }: SendArgs) {
  if (!cachedTransport) cachedTransport = createTransport();

  const info = await cachedTransport.sendMail({
    from: from ?? process.env.MAIL_FROM ?? "VetCare+ <no-reply@vetcare.local>",
    to,
    subject,
    html,
    text,
  });

  return info;
}
