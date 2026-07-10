import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../errors/AppError.js";
import { jwtUtils } from "../utils/jwt.js";
import config from "../config/index.js";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract token from Authorization header or cookies
      const token =
        req.headers.authorization?.split(" ")[1] ||
        req.cookies?.accessToken;

      if (!token) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "You are not logged in. Please log in to access this resource."
        );
      }

      // Verify token
      const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

      if (!verifiedToken.success || !verifiedToken.data) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Invalid or expired token. Please log in again."
        );
      }

      const { id } = verifiedToken.data as JwtPayload;

      // Check if user exists and is active
      const user = await prisma.user.findUnique({
        where: { id },
        omit: { password: true },
      });

      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found.");
      }

      if (user.status === "BANNED") {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Your account has been banned. Please contact support."
        );
      }

      // Check role-based access
      if (roles.length > 0 && !roles.includes(user.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You do not have permission to access this resource."
        );
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Convenience role guards
export const requireAdmin = auth("ADMIN");
export const requireTechnician = auth("TECHNICIAN");
export const requireCustomer = auth("CUSTOMER");
export const requireAdminOrTechnician = auth("ADMIN", "TECHNICIAN");
