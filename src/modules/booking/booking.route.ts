import { Router } from "express";
import { bookingController } from "./booking.controller.js";
import { requireCustomer, requireAdmin, requireTechnician, auth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createBookingSchema } from "./booking.validation.js";

const router = Router();

// Create booking
router.post(
  "/",
  requireCustomer,
  validateRequest(createBookingSchema),
  bookingController.createBooking
);

// Get bookings
router.get("/", auth(), bookingController.getBookings);
router.get("/:id", auth(), bookingController.getBookingById);

// State transitions
router.patch("/:id/admin-review", requireAdmin, bookingController.adminReviewBooking);
router.patch("/:id/technician-response", requireTechnician, bookingController.technicianResponseBooking);
router.patch("/:id/start", requireTechnician, bookingController.startBooking);
router.patch("/:id/complete", requireTechnician, bookingController.completeBooking);
router.patch("/:id/customer-confirm", requireCustomer, bookingController.customerConfirmBooking);
router.patch("/:id/customer-cancel", requireCustomer, bookingController.customerCancelBooking);

export const bookingRoutes = router;
