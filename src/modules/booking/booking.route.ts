import { Router } from "express";
import { bookingController } from "./booking.controller.js";
import { requireCustomer } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createBookingSchema } from "./booking.validation.js";

const router = Router();

// Protected endpoint: Only CUSTOMER role can request a booking
router.post(
  "/",
  requireCustomer,
  validateRequest(createBookingSchema),
  bookingController.createBooking
);

export const bookingRoutes = router;
