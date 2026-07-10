import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { IServiceFilterRequest } from "./service.interface.js";

const getServicesFromDB = async (filters: IServiceFilterRequest) => {
  const { searchTerm, categoryId, minPrice, maxPrice, location, minRating } = filters;

  const andConditions: Prisma.ServiceWhereInput[] = [];

  // Search by name or description
  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  // Filter by category
  if (categoryId) {
    andConditions.push({ categoryId });
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    const priceFilter: Prisma.DecimalFilter<"Service"> = {};
    if (minPrice) priceFilter.gte = minPrice;
    if (maxPrice) priceFilter.lte = maxPrice;
    andConditions.push({ basePrice: priceFilter });
  }

  // Filter by location or minimum rating (requires traversing to technician)
  if (location || minRating) {
    const techFilter: Prisma.TechnicianProfileWhereInput = {};
    
    if (location) {
      techFilter.location = { contains: location, mode: "insensitive" };
    }
    if (minRating) {
      techFilter.averageRating = { gte: minRating };
    }
    
    andConditions.push({ technician: techFilter });
  }

  const whereConditions: Prisma.ServiceWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.service.findMany({
    where: whereConditions,
    include: {
      category: { select: { id: true, name: true } },
      technician: {
        select: {
          id: true,
          bio: true,
          location: true,
          averageRating: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

export const serviceService = {
  getServicesFromDB,
};
