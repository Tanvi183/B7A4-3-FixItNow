import { Router } from "express";
import { categoryController } from "./category.controller.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createCategorySchema, updateCategorySchema } from "./category.validation.js";
import { requireAdmin } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", requireAdmin, validateRequest(createCategorySchema), categoryController.createCategory);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", requireAdmin, validateRequest(updateCategorySchema), categoryController.updateCategory);
router.delete("/:id", requireAdmin, categoryController.deleteCategory);

export const categoryRoutes = router;
