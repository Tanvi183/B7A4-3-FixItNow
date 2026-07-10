import { Router } from "express";
import { categoryController } from "./category.controller.js";

const router = Router();

router.get("/", categoryController.getCategories);

export const categoryRoutes = router;
