"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PetUpdateSchema = exports.PetCreateSchema = void 0;
const zod_1 = require("zod");
exports.PetCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    species: zod_1.z.string().min(1),
    breed: zod_1.z.string().optional().nullable(),
    dob: zod_1.z.string().datetime().optional().nullable(), // ISO date string
    photoUrl: zod_1.z.string().url().optional().nullable(),
});
exports.PetUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    species: zod_1.z.string().min(1).optional(),
    breed: zod_1.z.string().optional().nullable(),
    dob: zod_1.z.string().datetime().optional().nullable(),
    photoUrl: zod_1.z.string().url().optional().nullable(),
    archived: zod_1.z.boolean().optional(),
});
