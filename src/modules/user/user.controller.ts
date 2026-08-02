import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { userService } from "./user.service.js";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await userService.getProfileFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile fetched successfully!",
    data: result,
  });
});

const applyToBeTechnician = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await userService.updateUserRoleToTechnician(userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully applied as technician!",
    data: result,
  });
});

export const userController = {
  getMyProfile,
  applyToBeTechnician,
};
