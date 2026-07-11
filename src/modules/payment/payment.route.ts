import { Router } from "express";
import { paymentController } from "./payment.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createPaymentIntentSchema } from "./payment.validation.js";

const router = Router();

router.post(
  "/create",
  requireAuth,
  validateRequest(createPaymentIntentSchema),
  paymentController.createPaymentIntent
);

export const paymentRoutes = router;
