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

router.get("/", requireAuth, paymentController.getPaymentHistory);
router.get("/:id", requireAuth, paymentController.getPaymentDetails);

export const paymentRoutes = router;
