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

export const userController = {
  getMyProfile,
};
