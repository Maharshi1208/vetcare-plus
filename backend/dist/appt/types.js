"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusSchema = exports.RescheduleSchema = exports.CreateApptSchema = void 0;
const zod_1 = require("zod");
exports.CreateApptSchema = zod_1.z.object({
    petId: zod_1.z.string().min(1),
    vetId: zod_1.z.string().min(1),
    dateTime: zod_1.z.coerce.date(), // ISO string accepted
});
exports.RescheduleSchema = zod_1.z.object({
    newDateTime: zod_1.z.coerce.date(),
});
exports.StatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["BOOKED", "COMPLETED", "CANCELLED"]),
});
