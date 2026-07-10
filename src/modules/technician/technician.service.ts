import { prisma } from "../../lib/prisma.js";

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

export const technicianService = {
  getTechniciansFromDB,
  getTechnicianByIdFromDB,
  updateProfileInDB,
};
