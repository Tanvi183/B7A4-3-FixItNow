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

const getBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.getBookingsFromDB(req.user);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings fetched successfully!",
    data: result,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await bookingService.getBookingByIdFromDB(id, req.user);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking details fetched successfully!",
    data: result,
  });
});

export const bookingController = {
  createBooking,
  getBookings,
  getBookingById,
};
