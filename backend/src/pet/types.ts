import { z } from 'zod';

export const PetCreateSchema = z.object({
  name: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().optional().nullable(),
  dob: z.string().datetime().optional().nullable(), // ISO date string
  photoUrl: z.string().url().optional().nullable(),
});

export const PetUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  species: z.string().min(1).optional(),
  breed: z.string().optional().nullable(),
  dob: z.string().datetime().optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  archived: z.boolean().optional(),
});
