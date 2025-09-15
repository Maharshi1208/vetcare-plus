"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tmpl = void 0;
exports.tmpl = {
    appointmentBooked: (petName, vetName, whenISO) => ({
        subject: `Appointment booked for ${petName}`,
        html: `<h2>Appointment Confirmed</h2>
<p>Pet: <b>${petName}</b></p>
<p>Vet: <b>${vetName}</b></p>
<p>Date/Time: <b>${new Date(whenISO).toLocaleString()}</b></p>
<p>Thank you for using VetCare+.</p>`
    }),
    appointmentReminder: (petName, vetName, whenISO) => ({
        subject: `Reminder: ${petName}'s appointment is coming up`,
        html: `<h2>Appointment Reminder</h2>
<p>Pet: <b>${petName}</b></p>
<p>Vet: <b>${vetName}</b></p>
<p>Date/Time: <b>${new Date(whenISO).toLocaleString()}</b></p>
<p>See you soon!</p>`
    }),
    vaccinationDue: (petName, vaccine, dueISO) => ({
        subject: `Vaccination due: ${vaccine} for ${petName}`,
        html: `<h2>Vaccination Due Soon</h2>
<p>Pet: <b>${petName}</b></p>
<p>Vaccine: <b>${vaccine}</b></p>
<p>Due date: <b>${new Date(dueISO).toLocaleDateString()}</b></p>
<p>Please book an appointment.</p>`
    }),
};
