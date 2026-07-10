import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { serviceService } from "./service.service.js";
import { IServiceFilterRequest } from "./service.interface.js";

const getServices = catchAsync(async (req: Request, res: Response) => {
  const filters: IServiceFilterRequest = {
    searchTerm: req.query.searchTerm as string | undefined,
    categoryId: req.query.categoryId as string | undefined,
    minPrice: req.query.minPrice as string | undefined,
    maxPrice: req.query.maxPrice as string | undefined,
    location: req.query.location as string | undefined,
    minRating: req.query.minRating as string | undefined,
  };

  const result = await serviceService.getServicesFromDB(filters);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Services fetched successfully!",
    data: result,
  });
});

export const serviceController = {
  getServices,
};
