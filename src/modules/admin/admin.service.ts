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

export const adminService = {
  getAllUsersFromDB,
  updateUserStatusInDB,
};
