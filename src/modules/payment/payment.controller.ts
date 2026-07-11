import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { paymentService } from "./payment.service.js";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { bookingId } = req.body;
  
  const result = await paymentService.createPaymentIntentInDB(userId, bookingId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Payment intent created successfully!",
    data: result,
  });
});

export const paymentController = {
  createPaymentIntent,
};
