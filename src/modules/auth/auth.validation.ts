import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["CUSTOMER", "TECHNICIAN"] as const),
    bio: z.string().optional(),
    skills: z.array(z.string()).optional(),
    experienceYears: z.number().int().nonnegative().optional(),
    pricingRate: z.number().positive().optional(),
    availabilitySlots: z.array(z.string()).optional(),
  }).refine((data) => {
    if (data.role === "TECHNICIAN") {
      return (
        data.experienceYears !== undefined &&
        data.pricingRate !== undefined &&
        Array.isArray(data.skills) &&
        data.skills.length > 0
      );
    }
    return true;
  }, {
    message: "Technicians must provide experienceYears, pricingRate, and at least one skill",
    path: ["role"],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});
