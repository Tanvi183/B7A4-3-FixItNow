import { prisma } from "../../utils/prisma.js";

const createLocationInDB = async (payload: { name: string }) => {
  const result = await prisma.location.create({
    data: payload,
  });
  return result;
};

const getLocationsFromDB = async () => {
  const result = await prisma.location.findMany({
    orderBy: { name: "asc" }
  });
  return result;
};

const deleteLocationFromDB = async (id: string) => {
  const result = await prisma.location.delete({
    where: { id },
  });
  return result;
};

export const locationService = {
  createLocationInDB,
  getLocationsFromDB,
  deleteLocationFromDB,
};
