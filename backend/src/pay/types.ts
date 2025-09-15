import { z } from 'zod';

export const PaymentCreateSchema = z.object({
  appointmentId: z.string().min(1),
  // use cents/paise to avoid floating issues (e.g., 5000 = ₹50.00 / $50.00)
  amountCents: z.number().int().positive(),
  provider: z.string().min(1).default('mock'),
});

export type PaymentCreateInput = z.infer<typeof PaymentCreateSchema>;
