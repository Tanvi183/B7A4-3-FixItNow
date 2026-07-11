import { Router } from "express";
import { adminController } from "./admin.controller.js";
import { requireAdmin } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { updateUserStatusSchema } from "./admin.validation.js";

const router = Router();

router.get("/users", requireAdmin, adminController.getAllUsers);

router.patch(
  "/users/:id",
  requireAdmin,
  validateRequest(updateUserStatusSchema),
  adminController.updateUserStatus
);

export const adminRoutes = router;
