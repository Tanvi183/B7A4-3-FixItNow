import { Router } from "express";
import { technicianController } from "./technician.controller.js";

const router = Router();

// Public endpoints to list and view technician profiles
router.get("/", technicianController.getTechnicians);
router.get("/:id", technicianController.getTechnicianById);

export const technicianRoutes = router;
