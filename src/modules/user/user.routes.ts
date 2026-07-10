import { Router } from "express";
import { userController } from "./user.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

// Protected route — any logged-in user can access their own profile
router.get("/me", auth(), userController.getMyProfile);

export const userRoutes = router;
