import httpStatus from "http-status";
import { AppError } from "../../errors/AppError.js";
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

const updateUserRoleToTechnician = async (userId: string, payload: any) => {
  const { bio, skills, experienceYears, pricingRate, availabilitySlots } = payload;
  
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    include: { technicianProfile: true }
  });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  if (user.role === "TECHNICIAN") throw new AppError(httpStatus.BAD_REQUEST, "User is already a technician");
  if (user.technicianProfile) throw new AppError(httpStatus.BAD_REQUEST, "Technician application already submitted");
  
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      technicianProfile: {
        create: {
          bio: bio || "",
          skills: skills || [],
          experienceYears: Number(experienceYears) || 0,
          pricingRate: Number(pricingRate) || 0,
          availabilitySlots: availabilitySlots || [],
          isApproved: false // Explicitly marked as unapproved
        }
      }
    },
    omit: { password: true },
    include: { technicianProfile: true }
  });
  
  return updatedUser;
};

export const userService = {
  getProfileFromDB,
  updateUserRoleToTechnician,
};
