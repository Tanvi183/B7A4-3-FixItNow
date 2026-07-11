import { prisma } from "../../lib/prisma.js";
import httpStatus from "http-status";
import { AppError } from "../../errors/AppError.js";
import Stripe from "stripe";
import config from "../../config/index.js";

const stripe = new Stripe(config.stripe_secret_key as string, {
  apiVersion: "2024-04-10" as any,
});

const createPaymentIntentInDB = async (userId: string, bookingId: string) => {
  // Check if booking exists and belongs to user
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      customer: true,
    },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.customerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only pay for your own bookings"
    );
  }

  if (booking.status !== "ACCEPTED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Booking must be accepted before payment"
    );
  }

  // Create payment intent
  const amountInCents = Math.round(Number(booking.totalAmount) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    metadata: {
      bookingId: booking.id,
      userId: userId,
    },
  });

  // Create or update local payment record
  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId: booking.id },
  });

  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        transactionId: paymentIntent.id,
        amount: booking.totalAmount,
        method: "card",
        provider: "STRIPE",
        status: "PENDING",
      },
    });
  } else {
    await prisma.payment.update({
      where: { bookingId: booking.id },
      data: {
        transactionId: paymentIntent.id,
        status: "PENDING",
      },
    });
  }

  return {
    clientSecret: paymentIntent.client_secret,
    transactionId: paymentIntent.id,
  };
};

export const paymentService = {
  createPaymentIntentInDB,
};
