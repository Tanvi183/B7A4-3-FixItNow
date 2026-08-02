import { Router } from "express";
import { reviewController } from "./review.controller.js";
import { requireCustomer, auth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createReviewSchema } from "./review.validation.js";

const router = Router();

router.post(
  "/",
  requireCustomer,
  validateRequest(createReviewSchema),
  reviewController.createReview
);

router.get("/public", reviewController.getPublicReviews);
router.get("/", auth(), reviewController.getAllReviews);

export const reviewRoutes = router;
