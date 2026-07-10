import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong!";

  // Handling Zod validation errors
  if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";
    const errorMessages = err.issues.map((issue) => {
      return {
        path: issue.path[issue.path.length - 1] || "",
        message: issue.message,
      };
    });
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errorMessages,
      error: err,
    });
  }

  // Handling custom AppError
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handling Prisma Client errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "You have provided incorrect field type or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = httpStatus.BAD_REQUEST;
    if (err.code === "P2002") {
      message = "Duplicate Key Error: A record with this unique constraint already exists.";
    } else if (err.code === "P2003") {
      message = "Foreign Key Constraint: Foreign key constraint failed on reference relation.";
    } else if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      message = err.meta?.cause as string || "An operation failed because it depends on one or more records that were required but not found.";
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED;
      message = "Authentication failed against database server. Please Check Your Credentials.";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.BAD_GATEWAY;
      message = "Can't reach database server. Please check host connection.";
    }
  }

  // Return standard JSON response format
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error: err.stack || err.message || err,
  });
};
