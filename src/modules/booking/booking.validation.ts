import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string().uuid("Invalid service ID"),
    bookingDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid booking date format. Must be a valid ISO-8601 date.",
    }),
    timeSlot: z.string().min(1, "Time slot is required"),
  }),
});
