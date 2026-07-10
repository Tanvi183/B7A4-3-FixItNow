import { z } from "zod";

export const getServicesQuerySchema = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    categoryId: z.string().uuid("Invalid category ID").optional(),
    minPrice: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Invalid minPrice format")
      .optional(),
    maxPrice: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Invalid maxPrice format")
      .optional(),
    location: z.string().optional(),
    minRating: z
      .string()
      .regex(/^[0-5](\.\d{1,2})?$/, "Invalid minRating format (0-5)")
      .optional(),
  }),
});
