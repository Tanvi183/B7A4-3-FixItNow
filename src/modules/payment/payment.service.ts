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

const getPaymentHistoryFromDB = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        customerId: userId,
      },
    },
    include: {
      booking: {
        include: {
          service: {
            select: {
              name: true,
              basePrice: true,
            },
          },
        },
      },
    },
    orderBy: {
      paidAt: "desc",
    },
  });

  return payments;
};

const getPaymentDetailsFromDB = async (userId: string, id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (payment.booking.customerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to view this payment"
    );
  }

  return payment;
};

const confirmPaymentWebhookInDB = async (payload: any, signature: string) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe_webhook_secret as string
    );
  } catch (err: any) {
    throw new AppError(httpStatus.BAD_REQUEST, `Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    // Update payment record
    const payment = await prisma.payment.updateMany({
      where: { transactionId: paymentIntent.id },
      data: {
        status: "SUCCESS",
        paidAt: new Date(),
      },
    });

    if (payment.count > 0 && paymentIntent.metadata.bookingId) {
      // Update booking status
      await prisma.booking.update({
        where: { id: paymentIntent.metadata.bookingId },
        data: { status: "PAID" },
      });
    }
  }

  return { received: true };
};

export const paymentService = {
  createPaymentIntentInDB,
  getPaymentHistoryFromDB,
  getPaymentDetailsFromDB,
  confirmPaymentWebhookInDB,
};
