import { prisma } from "../../lib/prisma.js";
import httpStatus from "http-status";
import { AppError } from "../../errors/AppError.js";

const getTechniciansFromDB = async () => {
  const result = await prisma.technicianProfile.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      services: {
        select: {
          id: true,
          name: true,
          basePrice: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  return result;
};

const getTechnicianByIdFromDB = async (id: string) => {
  const result = await prisma.technicianProfile.findUniqueOrThrow({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      services: {
        include: {
          category: {
            select: {
              name: true,
            },
          },
          bookings: {
            where: {
              review: {
                isNot: null,
              },
            },
            include: {
              review: true,
              customer: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return result;
};

const updateProfileInDB = async (userId: string, payload: any) => {
  const result = await prisma.technicianProfile.update({
    where: { userId },
    data: payload,
  });
  return result;
};

const getTechnicianBookingsFromDB = async (userId: string) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      service: {
        technicianId: technicianProfile.id,
      },
    },
    include: {
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
      service: {
        select: {
          name: true,
          basePrice: true,
        },
      },
    },
  });

  return bookings;
};

const updateBookingStatusInDB = async (
  userId: string,
  bookingId: string,
  status: any
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
    },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.service.technicianId !== technicianProfile.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this booking"
    );
  }

  // State machine validation
  const validTransitions: Record<string, string[]> = {
    REQUESTED: ["ACCEPTED", "DECLINED"],
    ACCEPTED: ["PAID"], // Payment gateway handles this transition
    PAID: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED"],
    DECLINED: [],
    COMPLETED: [],
  };

  if (!validTransitions[booking.status].includes(status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot change status from ${booking.status} to ${status}`
    );
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });

  return updatedBooking;
};

export const technicianService = {
  getTechniciansFromDB,
  getTechnicianByIdFromDB,
  updateProfileInDB,
  getTechnicianBookingsFromDB,
  updateBookingStatusInDB,
};
