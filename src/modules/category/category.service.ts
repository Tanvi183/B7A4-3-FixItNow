import { prisma } from "../../lib/prisma.js";

const createCategoryInDB = async (payload: { name: string; description?: string }) => {
  const slug = payload.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const result = await prisma.category.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description,
    },
  });
  return result;
};

const getCategoriesFromDB = async () => {
  const result = await prisma.category.findMany();
  return result;
};

const getCategoryByIdFromDB = async (id: string) => {
  const result = await prisma.category.findUniqueOrThrow({
    where: { id },
  });
  return result;
};

const updateCategoryInDB = async (id: string, payload: { name?: string; description?: string }) => {
  const updateData: any = { ...payload };
  if (payload.name) {
    updateData.slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  const result = await prisma.category.update({
    where: { id },
    data: updateData,
  });
  return result;
};

const deleteCategoryFromDB = async (id: string) => {
  const result = await prisma.category.delete({
    where: { id },
  });
  return result;
};

export const categoryService = {
  createCategoryInDB,
  getCategoriesFromDB,
  getCategoryByIdFromDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
};
