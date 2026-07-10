import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { bookingService } from "./booking.service.js";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user.id;
  const result = await bookingService.createBookingInDB(customerId, req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Booking requested successfully!",
    data: result,
  });
});

export const bookingController = {
  createBooking,
};
