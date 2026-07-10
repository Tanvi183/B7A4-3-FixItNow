import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import config from "../../config/index.js";
import { prisma } from "../../lib/prisma.js";
import { jwtUtils } from "../../utils/jwt.js";
import { AppError } from "../../errors/AppError.js";
import httpStatus from "http-status";
import { ILoginUser } from "./auth.interface.js";

const registerUser = async (payload: any) => {
  const { name, email, password, role, bio, skills, experienceYears, pricingRate, availabilitySlots } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_rounds);

  if (role === "CUSTOMER") {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: "ACTIVE"
      },
      omit: {
        password: true
      }
    });
    return newUser;
  }

  if (role === "TECHNICIAN") {
    const newTechnician = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: "ACTIVE",
        technicianProfile: {
          create: {
            bio: bio || "",
            skills: skills || [],
            experienceYears: Number(experienceYears),
            pricingRate: Number(pricingRate),
            availabilitySlots: availabilitySlots || []
          }
        }
      },
      omit: {
        password: true
      },
      include: {
        technicianProfile: true
      }
    });
    return newTechnician;
  }

  throw new AppError(httpStatus.BAD_REQUEST, "Invalid role type requested");
};

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.status === "BANNED") {
    throw new AppError(httpStatus.FORBIDDEN, "Your account has been banned. Please contact support.");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Password is incorrect");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in
  );

  return {
    accessToken,
    refreshToken
  };
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is missing");
  }

  const verifiedToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret);

  if (!verifiedToken.success || !verifiedToken.data) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is invalid or expired");
  }

  const { id } = verifiedToken.data as JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.status === "BANNED") {
    throw new AppError(httpStatus.FORBIDDEN, "User is banned");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in
  );

  return {
    accessToken
  };
};

export const authService = {
  registerUser,
  loginUser,
  refreshToken
};
