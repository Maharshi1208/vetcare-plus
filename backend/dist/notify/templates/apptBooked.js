"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderApptBooked = renderApptBooked;
const layout_1 = require("./layout");
function renderApptBooked(vars) {
    const { petName, vetName, dateTimeISO, manageUrl } = vars;
    const date = new Date(dateTimeISO);
    const pretty = date.toLocaleString("en-CA", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
    const bodyHtml = `
    <h1 style="margin:0 0 12px 0;font-size:20px;">Appointment Confirmed</h1>
    <p style="margin:0 0 8px 0;">Hi,</p>
    <p style="margin:0 0 8px 0;">Your appointment has been booked.</p>
    <ul style="margin:0 0 12px 20px;padding:0;">
      <li><strong>Pet:</strong> ${petName}</li>
      <li><strong>Vet:</strong> ${vetName}</li>
      <li><strong>Date &amp; Time:</strong> ${pretty}</li>
    </ul>
    ${manageUrl
        ? `<p style="margin:16px 0;"><a href="${manageUrl}" style="display:inline-block;padding:10px 14px;text-decoration:none;border-radius:6px;border:1px solid #0b5ed7;">Manage Appointment</a></p>`
        : ""}
    <p style="margin:16px 0 0 0;">Thanks,<br/>VetCare+ Team</p>
  `;
    return {
        subject: `VetCare+ appointment for ${petName} with ${vetName}`,
        html: (0, layout_1.renderLayout)({ title: "Appointment Booked", bodyHtml }),
        text: `Appointment Confirmed
Pet: ${petName}
Vet: ${vetName}
Date & Time: ${pretty}
${manageUrl ? `Manage: ${manageUrl}` : ""}

Thanks,
VetCare+ Team`,
    };
}
