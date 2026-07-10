import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { technicianService } from "./technician.service.js";

const getTechnicians = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.getTechniciansFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technicians fetched successfully!",
    data: result,
  });
});

const getTechnicianById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await technicianService.getTechnicianByIdFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician details fetched successfully!",
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await technicianService.updateProfileInDB(userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician profile updated successfully!",
    data: result,
  });
});

export const technicianController = {
  getTechnicians,
  getTechnicianById,
  updateProfile,
};
