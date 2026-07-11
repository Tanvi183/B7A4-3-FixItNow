import { Router } from "express";
import { reviewController } from "./review.controller.js";
import { requireCustomer } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createReviewSchema } from "./review.validation.js";

const router = Router();

router.post(
  "/",
  requireCustomer,
  validateRequest(createReviewSchema),
  reviewController.createReview
);

export const reviewRoutes = router;
