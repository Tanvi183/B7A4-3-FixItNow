import { Router } from "express";
import { paymentController } from "./payment.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createPaymentIntentSchema } from "./payment.validation.js";

const router = Router();

router.post(
  "/create",
  auth(),
  validateRequest(createPaymentIntentSchema),
  paymentController.createPaymentIntent
);

router.get("/", auth(), paymentController.getPaymentHistory);
router.get("/:id", auth(), paymentController.getPaymentDetails);

// Webhook doesn't require standard JWT auth, Stripe uses signatures
router.post("/confirm", paymentController.confirmWebhook);

export const paymentRoutes = router;
