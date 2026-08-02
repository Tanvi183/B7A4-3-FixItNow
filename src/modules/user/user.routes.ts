import { Router } from "express";
import { userController } from "./user.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

// Protected route — any logged-in user can access their own profile
router.get("/me", auth(), userController.getMyProfile);

// Endpoint for an existing customer to become a technician
router.patch("/apply-technician", auth("CUSTOMER"), userController.applyToBeTechnician);

export const userRoutes = router;
