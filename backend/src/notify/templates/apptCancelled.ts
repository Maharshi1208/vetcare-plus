// src/notify/templates/apptCancelled.ts
type Opts = {
  petName: string;
  vetName: string;
  dateTimeISO: string;
  manageUrl?: string;
};

export function renderApptCancelled(opts: Opts) {
  const when = new Date(opts.dateTimeISO).toLocaleString();

  const subject = `Appointment Cancelled: ${opts.petName} with ${opts.vetName}`;
  const text = [
    `Your appointment for ${opts.petName} with ${opts.vetName} on ${when} has been cancelled.`,
    opts.manageUrl ? `Manage appointments: ${opts.manageUrl}` : ``,
  ].filter(Boolean).join("\n");

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
      <h2>Appointment Cancelled</h2>
      <p>Your appointment for <b>${opts.petName}</b> with <b>${opts.vetName}</b> on <b>${when}</b> has been cancelled.</p>
      ${opts.manageUrl ? `<p><a href="${opts.manageUrl}">Manage your appointments</a></p>` : ``}
      <hr/>
      <p>Thanks,<br/>VetCare+</p>
    </div>
  `;
  return { subject, text, html };
}
