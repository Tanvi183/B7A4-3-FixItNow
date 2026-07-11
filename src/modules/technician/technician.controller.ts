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

const getBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await technicianService.getTechnicianBookingsFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician bookings fetched successfully!",
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params as { id: string };
  const { status } = req.body;
  const result = await technicianService.updateBookingStatusInDB(
    userId,
    id,
    status
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Booking status updated to ${status} successfully!`,
    data: result,
  });
});

export const technicianController = {
  getTechnicians,
  getTechnicianById,
  updateProfile,
  getBookings,
  updateBookingStatus,
};
