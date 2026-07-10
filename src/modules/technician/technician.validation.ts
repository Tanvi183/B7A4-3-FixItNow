import { z } from "zod";

export const updateTechnicianProfileSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    skills: z.array(z.string()).optional(),
    experienceYears: z.number().int().nonnegative().optional(),
    pricingRate: z.number().positive().optional(),
    availabilitySlots: z.array(z.string()).optional(),
    location: z.string().optional(),
  }),
});
