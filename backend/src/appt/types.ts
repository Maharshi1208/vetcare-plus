import { z } from "zod";

export const CreateApptSchema = z.object({
  petId: z.string().min(1),
  vetId: z.string().min(1),
  dateTime: z.coerce.date(), // ISO string accepted
});

export const RescheduleSchema = z.object({
  newDateTime: z.coerce.date(),
});

export const StatusSchema = z.object({
  status: z.enum(["BOOKED", "COMPLETED", "CANCELLED"]),
});
