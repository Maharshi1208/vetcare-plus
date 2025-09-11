import { z } from "zod";

/** Vet payloads */
export const CreateVetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  specialization: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional()
});

export const UpdateVetSchema = z.object({
  name: z.string().min(1).optional(),
  specialization: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  archived: z.boolean().optional()
});

/** Availability payloads */
export const CreateAvailabilitySchema = z.object({
  startAt: z.coerce.date(),   // accepts ISO string, coerces to Date
  endAt: z.coerce.date()
}).refine(v => v.endAt > v.startAt, {
  message: "endAt must be after startAt",
  path: ["endAt"]
});

export const UpdateAvailabilitySchema = z.object({
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  isBooked: z.boolean().optional()
}).refine(v => !v.startAt || !v.endAt || (v.endAt > v.startAt!), {
  message: "endAt must be after startAt",
  path: ["endAt"]
});
