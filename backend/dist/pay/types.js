"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentCreateSchema = void 0;
const zod_1 = require("zod");
exports.PaymentCreateSchema = zod_1.z.object({
    appointmentId: zod_1.z.string().min(1),
    // use cents/paise to avoid floating issues (e.g., 5000 = ₹50.00 / $50.00)
    amountCents: zod_1.z.number().int().positive(),
    provider: zod_1.z.string().min(1).default('mock'),
});
