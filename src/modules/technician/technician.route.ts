import { Router } from "express";
import { technicianController } from "./technician.controller.js";
import { requireTechnician } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { updateTechnicianProfileSchema } from "./technician.validation.js";

const router = Router();

// Protected endpoint for technicians to update their own profile
router.put(
  "/profile",
  requireTechnician,
  validateRequest(updateTechnicianProfileSchema),
  technicianController.updateProfile
);

// Public endpoints to list and view technician profiles
router.get("/", technicianController.getTechnicians);
router.get("/:id", technicianController.getTechnicianById);

export const technicianRoutes = router;
