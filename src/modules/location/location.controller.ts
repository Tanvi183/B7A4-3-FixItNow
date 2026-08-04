import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { locationService } from "./location.service.js";

const createLocation = catchAsync(async (req: Request, res: Response) => {
  const result = await locationService.createLocationInDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Location created successfully!",
    data: result,
  });
});

const getLocations = catchAsync(async (req: Request, res: Response) => {
  const result = await locationService.getLocationsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Locations fetched successfully!",
    data: result,
  });
});

const deleteLocation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await locationService.deleteLocationFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Location deleted successfully!",
    data: result,
  });
});

export const locationController = {
  createLocation,
  getLocations,
  deleteLocation,
};
