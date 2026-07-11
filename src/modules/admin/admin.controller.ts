import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { adminService } from "./admin.service.js";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllUsersFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users fetched successfully!",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { status } = req.body;
  const result = await adminService.updateUserStatusInDB(id, status);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `User status updated to ${status} successfully!`,
    data: result,
  });
});

export const adminController = {
  getAllUsers,
  updateUserStatus,
};
