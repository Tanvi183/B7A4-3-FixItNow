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
<<<<<<< HEAD
=======

// Webhook doesn't require standard JWT auth, Stripe uses signatures
router.post("/confirm", paymentController.confirmWebhook);
>>>>>>> f836aa7e323eee5cbf03e859dbbb8668ef3b6984

export const paymentRoutes = router;
