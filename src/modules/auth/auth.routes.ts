import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), authController.registerUser);
router.post("/login", validateRequest(loginSchema), authController.loginUser);
router.post("/refresh-token", authController.refreshToken);

export const authRoutes = router;
