import httpStatus from "http-status";
import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { ICreateBookingRequest } from "./booking.interface.js";
import { BookingStatus, Role } from "@prisma/client";

// Helper for status history
const createStatusHistory = async (
  bookingId: string,
  oldStatus: BookingStatus,
  newStatus: BookingStatus,
  userId: string,
  role: Role,
  note?: string
) => {
  if (oldStatus === newStatus) return;
  await prisma.statusHistory.create({
    data: {
      bookingId,
      oldStatus,
      newStatus,
      changedById: userId,
      changedByRole: role.toLowerCase(),
      note,
    },
  });
};

const createBookingInDB = async (customerId: string, payload: ICreateBookingRequest) => {
  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId },
  });

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found.");
  }

  const result = await prisma.booking.create({
    data: {
      customerId,
      serviceId: payload.serviceId,
      bookingDate: new Date(payload.bookingDate),
      timeSlot: payload.timeSlot,
      totalAmount: service.basePrice,
      status: "requested",
    },
    include: {
      service: { select: { name: true } },
      customer: { select: { name: true, email: true } },
    },
  });

  return result;
};

const getBookingsFromDB = async (user: any) => {
  let where: any = {};
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const role = dbUser ? dbUser.role : user.role;

  if (role === "CUSTOMER") {
    where = { customerId: user.id };
  } else if (role === "TECHNICIAN") {
    where = { technicianId: user.id };
  }
  // Admin sees all

  const result = await prisma.booking.findMany({
    where,
    include: {
      service: { select: { id: true, name: true, basePrice: true, categoryId: true, category: { select: { id: true, name: true } } } },
      customer: { select: { name: true, email: true } },
      technician: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Transform for frontend which expects customer.user.name and technician.user.name
  return result.map((r: any) => ({
    ...r,
    customer: { user: r.customer },
    technician: r.technician ? { user: r.technician } : null
  }));
};

const getBookingByIdFromDB = async (id: string, user: any) => {
  const result = await prisma.booking.findUniqueOrThrow({
    where: { id },
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
      technician: { select: { name: true, email: true } },
      payment: true,
      review: true,
      statusHistory: { orderBy: { createdAt: 'desc' } }
    },
  });

  if (user.role === "CUSTOMER" && result.customerId !== user.id) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to view this booking.");
  }

  if (user.role === "TECHNICIAN" && result.technicianId !== user.id) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to view this booking.");
  }

  return result;
};

// State Transitions

const adminReviewBooking = async (id: string, adminId: string, action: "approve" | "reject" | "resolve" | "approve_cancellation" | "reject_cancellation" | "reassign", technicianId?: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });

  let newStatus: BookingStatus = booking.status;
  
  if (action === "approve_cancellation") {
    if (booking.status !== "cancellation_requested") {
      throw new AppError(httpStatus.BAD_REQUEST, `Cannot approve cancellation for booking in ${booking.status} state.`);
    }
    newStatus = "cancelled";
    await prisma.booking.update({
      where: { id },
      data: { status: newStatus },
    });
  } else if (action === "reject_cancellation") {
    if (booking.status !== "cancellation_requested") {
      throw new AppError(httpStatus.BAD_REQUEST, `Cannot reject cancellation for booking in ${booking.status} state.`);
    }
    // Revert to assigned (approved mode) so work can continue
    newStatus = "assigned";
    await prisma.booking.update({
      where: { id },
      data: { status: newStatus },
    });
  } else if (action === "reassign") {
    // Allow reassigning technician at any active state
    if (!technicianId) throw new AppError(httpStatus.BAD_REQUEST, "technicianId is required for reassignment.");
    if (!["requested", "assigned", "technician_accepted", "in_progress", "technician_declined"].includes(booking.status)) {
      throw new AppError(httpStatus.BAD_REQUEST, `Cannot reassign technician to booking in ${booking.status} state.`);
    }
    newStatus = "assigned";
    await prisma.booking.update({
      where: { id },
      data: { status: newStatus, technicianId, assignedAt: new Date() },
    });
  } else {
    if (!["requested", "technician_declined", "customer_disputed", "REQUESTED"].includes(booking.status)) {
      throw new AppError(httpStatus.BAD_REQUEST, `Cannot review booking in ${booking.status} state.`);
    }

    if (action === "reject") {
      newStatus = "admin_rejected";
      await prisma.booking.update({
        where: { id },
        data: { status: newStatus },
      });
    } else if (action === "approve") {
      if (!technicianId) throw new AppError(httpStatus.BAD_REQUEST, "technicianId is required for approval.");
      newStatus = "assigned";
      await prisma.booking.update({
        where: { id },
        data: { status: newStatus, technicianId, assignedAt: new Date() },
      });
    } else if (action === "resolve" && booking.status === "customer_disputed") {
      // Admin mediates and sets back to in_progress to be redone
      newStatus = "in_progress";
      await prisma.booking.update({
        where: { id },
        data: { status: newStatus },
      });
    }
  }

  await createStatusHistory(id, booking.status, newStatus, adminId, Role.ADMIN);
  return { status: newStatus };
};

const technicianResponseBooking = async (id: string, techId: string, action: "accept" | "decline") => {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });

  if (booking.technicianId !== techId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not assigned to this booking.");
  }
  if (!["assigned", "REQUESTED"].includes(booking.status)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Cannot respond to booking in ${booking.status} state.`);
  }

  const newStatus: BookingStatus = action === "accept" ? "technician_accepted" : "technician_declined";
  
  await prisma.booking.update({
    where: { id },
    data: { 
      status: newStatus,
      technicianRespondedAt: new Date(),
      ...(action === "decline" ? { technicianId: null } : {}) // unassign if declined so admin can reassign
    },
  });

  await createStatusHistory(id, booking.status, newStatus, techId, Role.TECHNICIAN);
  return { status: newStatus };
};

const startBooking = async (id: string, techId: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });
  
  if (booking.technicianId !== techId) throw new AppError(httpStatus.FORBIDDEN, "Unauthorized");
  if (!["technician_accepted", "ACCEPTED"].includes(booking.status)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Cannot start booking in ${booking.status} state.`);
  }

  const newStatus: BookingStatus = "in_progress";
  await prisma.booking.update({
    where: { id },
    data: { status: newStatus },
  });

  await createStatusHistory(id, booking.status, newStatus, techId, Role.TECHNICIAN);
  return { status: newStatus };
};

const completeBooking = async (id: string, techId: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });
  
  if (booking.technicianId !== techId) throw new AppError(httpStatus.FORBIDDEN, "Unauthorized");
  if (!["in_progress", "IN_PROGRESS"].includes(booking.status)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Cannot complete booking in ${booking.status} state.`);
  }

  const newStatus: BookingStatus = "work_completed";
  await prisma.booking.update({
    where: { id },
    data: { status: newStatus, workCompletedAt: new Date() },
  });

  await createStatusHistory(id, booking.status, newStatus, techId, Role.TECHNICIAN);
  return { status: newStatus };
};

const customerConfirmBooking = async (id: string, customerId: string, action: "approve" | "dispute") => {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });
  
  if (booking.customerId !== customerId) throw new AppError(httpStatus.FORBIDDEN, "Unauthorized");
  if (booking.status !== "work_completed") {
    throw new AppError(httpStatus.BAD_REQUEST, `Cannot confirm booking in ${booking.status} state.`);
  }

  const newStatus: BookingStatus = action === "approve" ? "payment_pending" : "customer_disputed";
  await prisma.booking.update({
    where: { id },
    data: { status: newStatus, customerConfirmedAt: new Date() },
  });

  await createStatusHistory(id, booking.status, newStatus, customerId, Role.CUSTOMER);
  return { status: newStatus };
};

const customerCancelBooking = async (id: string, customerId: string, offerAmount?: number) => {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });
  
  if (booking.customerId !== customerId) throw new AppError(httpStatus.FORBIDDEN, "Unauthorized");
  
  if (["requested", "REQUESTED"].includes(booking.status)) {
    // Direct cancel before admin touches it
    await prisma.booking.update({
      where: { id },
      data: { status: "cancelled" },
    });
    await createStatusHistory(id, booking.status, "cancelled", customerId, Role.CUSTOMER);
    return { status: "cancelled" };
  } else if (["cancellation_approved"].includes(booking.status)) {
    // Technician approved the cancellation fee offer, so we can finally cancel it
    // Set totalAmount to the agreed cancellation fee
    await prisma.booking.update({
      where: { id },
      data: { 
        status: "cancelled", 
        totalAmount: booking.cancellationOffer ?? booking.totalAmount
      },
    });
    await createStatusHistory(id, booking.status, "cancelled", customerId, Role.CUSTOMER, `Finalized cancellation with fee: $${booking.cancellationOffer}`);
    return { status: "cancelled" };
  } else if (["assigned", "technician_accepted", "in_progress", "technician_declined"].includes(booking.status)) {
    // Apply for cancellation and offer a fee
    await prisma.booking.update({
      where: { id },
      data: { 
        status: "cancellation_requested",
        cancellationOffer: offerAmount ? Number(offerAmount) : null
      },
    });
    await createStatusHistory(id, booking.status, "cancellation_requested", customerId, Role.CUSTOMER, offerAmount ? `Offered cancellation fee: $${offerAmount}` : "Requested cancellation without fee");
    return { status: "cancellation_requested" };
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, `Cannot cancel booking in ${booking.status} state.`);
  }
};

const technicianCancellationResponse = async (id: string, technicianId: string, action: "accept" | "reject") => {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });
  
  if (booking.technicianId !== technicianId) throw new AppError(httpStatus.FORBIDDEN, "Unauthorized");
  if (booking.status !== "cancellation_requested") {
    throw new AppError(httpStatus.BAD_REQUEST, `No cancellation request to respond to.`);
  }

  if (action === "accept") {
    await prisma.booking.update({
      where: { id },
      data: { 
        status: "cancellation_approved",
        totalAmount: booking.cancellationOffer ?? booking.totalAmount 
      },
    });
    await createStatusHistory(id, booking.status, "cancellation_approved", technicianId, Role.TECHNICIAN, "Accepted cancellation fee offer");
    return { status: "cancellation_approved" };
  } else {
    // Rejecting means going back to technician_accepted (so they can resume work)
    await prisma.booking.update({
      where: { id },
      data: { 
        status: "technician_accepted",
        cancellationOffer: null // clear the offer
      },
    });
    await createStatusHistory(id, booking.status, "technician_accepted", technicianId, Role.TECHNICIAN, "Rejected cancellation request");
    return { status: "technician_accepted" };
  }
};

const deleteBookingFromDB = async (id: string, customerId: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });
  
  if (booking.customerId !== customerId) throw new AppError(httpStatus.FORBIDDEN, "Unauthorized");
  
  if (!["cancelled", "CANCELLED", "admin_rejected", "DECLINED", "customer_disputed"].includes(booking.status)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Cannot delete booking in ${booking.status} state. Only cancelled bookings can be removed.`);
  }

  // Delete associated status history first due to foreign key constraints
  await prisma.statusHistory.deleteMany({ where: { bookingId: id } });
  
  await prisma.booking.delete({
    where: { id },
  });
  
  return null;
};

export const bookingService = {
  createBookingInDB,
  getBookingsFromDB,
  getBookingByIdFromDB,
  adminReviewBooking,
  technicianResponseBooking,
  startBooking,
  completeBooking,
  customerConfirmBooking,
  customerCancelBooking,
  technicianCancellationResponse,
  deleteBookingFromDB,
};
