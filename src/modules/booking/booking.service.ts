import httpStatus from "http-status";
import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { ICreateBookingRequest } from "./booking.interface.js";

const createBookingInDB = async (customerId: string, payload: ICreateBookingRequest) => {
  // 1. Check if the service exists
  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId },
  });

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found.");
  }

  // 2. Create the booking with the service's base price as totalAmount
  const result = await prisma.booking.create({
    data: {
      customerId,
      serviceId: payload.serviceId,
      bookingDate: new Date(payload.bookingDate),
      timeSlot: payload.timeSlot,
      totalAmount: service.basePrice,
    },
    include: {
      service: {
        select: { name: true },
      },
      customer: {
        select: { name: true, email: true },
      },
    },
  });

  return result;
};

export const bookingService = {
  createBookingInDB,
};
