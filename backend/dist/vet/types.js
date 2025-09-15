"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAvailabilitySchema = exports.CreateAvailabilitySchema = exports.UpdateVetSchema = exports.CreateVetSchema = void 0;
const zod_1 = require("zod");
/** Vet payloads */
exports.CreateVetSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    specialization: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional()
});
exports.UpdateVetSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    specialization: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    archived: zod_1.z.boolean().optional()
});
/** Availability payloads */
exports.CreateAvailabilitySchema = zod_1.z.object({
    startAt: zod_1.z.coerce.date(), // accepts ISO string, coerces to Date
    endAt: zod_1.z.coerce.date()
}).refine(v => v.endAt > v.startAt, {
    message: "endAt must be after startAt",
    path: ["endAt"]
});
exports.UpdateAvailabilitySchema = zod_1.z.object({
    startAt: zod_1.z.coerce.date().optional(),
    endAt: zod_1.z.coerce.date().optional(),
    isBooked: zod_1.z.boolean().optional()
}).refine(v => !v.startAt || !v.endAt || (v.endAt > v.startAt), {
    message: "endAt must be after startAt",
    path: ["endAt"]
});
