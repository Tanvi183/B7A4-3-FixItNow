import { Router } from "express";
import { serviceController } from "./service.controller.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { getServicesQuerySchema } from "./service.validation.js";

const router = Router();

// Public endpoint for listing services with filters
router.get("/", validateRequest(getServicesQuerySchema), serviceController.getServices);

export const serviceRoutes = router;
