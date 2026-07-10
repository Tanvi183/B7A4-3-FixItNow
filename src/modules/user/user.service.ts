import { prisma } from "../../lib/prisma.js";

const getProfileFromDB = async (userId: string) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: { password: true },
    include: {
      technicianProfile: true,
    },
  });
  return result;
};

export const userService = {
  getProfileFromDB,
};
