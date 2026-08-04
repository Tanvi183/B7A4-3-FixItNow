import express from "express";
import { locationController } from "./location.controller.js";
import auth from "../../middlewares/auth.js";

const router = express.Router();

router.post("/", auth("ADMIN", "admin"), locationController.createLocation);
router.get("/", locationController.getLocations);
router.delete("/:id", auth("ADMIN", "admin"), locationController.deleteLocation);

export const locationRoutes = router;
