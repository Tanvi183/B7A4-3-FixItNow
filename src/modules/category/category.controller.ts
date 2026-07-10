import { Request, Response } from "express";
import { categoryService } from "./category.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.createCategoryInDB(req.body);
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Category created successfully!",
    data: result,
  });
});

const getCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.getCategoriesFromDB();
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Categories fetched successfully!",
    data: result,
  });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await categoryService.getCategoryByIdFromDB(id);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Category fetched successfully!",
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await categoryService.updateCategoryInDB(id, req.body);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Category updated successfully!",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await categoryService.deleteCategoryFromDB(id);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Category deleted successfully!",
    data: result,
  });
});

export const categoryController = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
