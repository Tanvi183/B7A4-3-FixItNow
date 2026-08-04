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

const adminReviewBooking = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { action, technicianId } = req.body;
  const result = await bookingService.adminReviewBooking(id, req.user.id as string, action, technicianId);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Booking reviewed.", data: result });
});

const technicianResponseBooking = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { action } = req.body;
  const result = await bookingService.technicianResponseBooking(id, req.user.id as string, action);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Responded to booking.", data: result });
});

const startBooking = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await bookingService.startBooking(id, req.user.id as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Job started.", data: result });
});

const completeBooking = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await bookingService.completeBooking(id, req.user.id as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Job completed.", data: result });
});

const customerConfirmBooking = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { action } = req.body;
  const result = await bookingService.customerConfirmBooking(id, req.user.id as string, action);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Customer confirmation recorded.", data: result });
});

const customerCancelBooking = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const offerAmount = req.body.offerAmount;
  const result = await bookingService.customerCancelBooking(id, req.user.id as string, offerAmount);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Booking cancelled successfully.", data: result });
});

const technicianCancellationResponse = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { action } = req.body;
  const result = await bookingService.technicianCancellationResponse(id, req.user.id as string, action);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: `Cancellation request ${action}ed successfully.`, data: result });
});

const deleteBooking = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await bookingService.deleteBookingFromDB(id, req.user.id as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Booking deleted successfully.", data: result });
});

export const bookingController = {
  createBooking,
  getBookings,
  getBookingById,
  adminReviewBooking,
  technicianResponseBooking,
  startBooking,
  completeBooking,
  customerConfirmBooking,
  customerCancelBooking,
  technicianCancellationResponse,
  deleteBooking,
};
