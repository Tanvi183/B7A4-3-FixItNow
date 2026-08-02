import { prisma } from "../../lib/prisma.js";
import httpStatus from "http-status";
import { AppError } from "../../errors/AppError.js";

const getAllUsersFromDB = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return users;
};

const updateUserStatusInDB = async (id: string, status: any) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.role === "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Cannot change the status of an Admin user"
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return updatedUser;
};

const approveTechnician = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { technicianProfile: true }
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!user.technicianProfile) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not have a technician application");
  }

  if (user.technicianProfile.isApproved) {
    throw new AppError(httpStatus.BAD_REQUEST, "Technician is already approved");
  }

  // Update both the user role and the profile approval status in a transaction
  const [updatedProfile, updatedUser] = await prisma.$transaction([
    prisma.technicianProfile.update({
      where: { userId },
      data: { isApproved: true }
    }),
    prisma.user.update({
      where: { id: userId },
      data: { role: "TECHNICIAN" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      }
    })
  ]);

  return updatedUser;
};

export const adminService = {
  getAllUsersFromDB,
  updateUserStatusInDB,
  approveTechnician,
};
