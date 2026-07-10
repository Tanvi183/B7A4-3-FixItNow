import { Router } from "express";
import { categoryController } from "./category.controller.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createCategorySchema, updateCategorySchema } from "./category.validation.js";

const router = Router();

router.post("/", validateRequest(createCategorySchema), categoryController.createCategory);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", validateRequest(updateCategorySchema), categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export const categoryRoutes = router;
