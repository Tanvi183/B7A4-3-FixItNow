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

const getBookingsFromDB = async (user: any) => {
  let where: any = {};
  
  if (user.role === "CUSTOMER") {
    where = { customerId: user.id };
  } else if (user.role === "TECHNICIAN") {
    where = {
      service: {
        technician: {
          userId: user.id,
        },
      },
    };
  }
  // Admin sees all

  const result = await prisma.booking.findMany({
    where,
    include: {
      service: { select: { name: true } },
      customer: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getBookingByIdFromDB = async (id: string, user: any) => {
  const result = await prisma.booking.findUniqueOrThrow({
    where: { id },
    include: {
      service: {
        include: {
          technician: true,
        },
      },
      customer: {
        select: { name: true, email: true },
      },
      payment: true,
      review: true,
    },
  });

  // Role-based access control
  if (user.role === "CUSTOMER" && result.customerId !== user.id) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to view this booking.");
  }

  if (user.role === "TECHNICIAN" && result.service.technician.userId !== user.id) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to view this booking.");
  }

  return result;
};

export const bookingService = {
  createBookingInDB,
  getBookingsFromDB,
  getBookingByIdFromDB,
};
