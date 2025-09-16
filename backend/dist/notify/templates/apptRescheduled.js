"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderApptRescheduled = renderApptRescheduled;
function renderApptRescheduled(opts) {
    const oldDate = new Date(opts.oldDateTimeISO);
    const newDate = new Date(opts.newDateTimeISO);
    const oldFmt = oldDate.toLocaleString();
    const newFmt = newDate.toLocaleString();
    const subject = `Appointment Rescheduled: ${opts.petName} with ${opts.vetName}`;
    const text = [
        `Your appointment for ${opts.petName} with ${opts.vetName} has been rescheduled.`,
        `Old time: ${oldFmt}`,
        `New time: ${newFmt}`,
        opts.manageUrl ? `Manage appointments: ${opts.manageUrl}` : ``,
    ].filter(Boolean).join("\n");
    const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
      <h2>Appointment Rescheduled</h2>
      <p>Your appointment for <b>${opts.petName}</b> with <b>${opts.vetName}</b> has been updated.</p>
      <p><b>Old time:</b> ${oldFmt}<br/><b>New time:</b> ${newFmt}</p>
      ${opts.manageUrl ? `<p><a href="${opts.manageUrl}">Manage your appointments</a></p>` : ``}
      <hr/>
      <p>Thanks,<br/>VetCare+</p>
    </div>
  `;
    return { subject, text, html };
}
