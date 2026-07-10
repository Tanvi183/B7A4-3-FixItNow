import { prisma } from "../../lib/prisma.js";

const getCategoriesFromDB = async () => {
  const result = await prisma.category.findMany();
  return result;
};

export const categoryService = {
  getCategoriesFromDB
};
