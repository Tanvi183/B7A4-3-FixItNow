import { Request, Response } from "express";
import { categoryService } from "./category.service.js";

const getCategories = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.getCategoriesFromDB();
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Categories fetched successfully!",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to fetch categories",
      error: error.message
    });
  }
};

export const categoryController = {
  getCategories
};
