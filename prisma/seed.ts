import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function main() {
  console.log("🌱 Start seeding database...");

  // 1. Seed Categories (Idempotent upsert)
  const categories = [
    { name: "Plumbing", slug: "plumbing", description: "Professional plumbing repairs, leak detection, and installations" },
    { name: "Electrical works", slug: "electrical-works", description: "Certified electrical troubleshooting, wiring, and fixture installs" },
    { name: "Cleaning", slug: "cleaning", description: "Deep home and office sanitization and cleaning services" },
    { name: "Painting", slug: "painting", description: "High-quality residential and commercial painting" },
    { name: "Appliance Repair", slug: "appliance-repair", description: "AC, Fridge, and Washing Machines" },
    { name: "Carpentry", slug: "carpentry", description: "Woodwork, furniture repair, and custom builds" },
    { name: "Assembling", slug: "assembling", description: "Furniture and equipment assembly" },
    { name: "Landscaping", slug: "landscaping", description: "Outdoor maintenance and gardening" },
    { name: "General Maintenance", slug: "general-maintenance", description: "Routine home repairs and handyman tasks" }
  ];

  console.log("Creating categories...");
  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: cat,
      create: cat
    });
    createdCategories[created.name] = created.id;
  }

  // 2. Seed Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@fixitnow.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

  console.log(`Upserting admin account: ${adminEmail}`);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Platform Admin",
      email: adminEmail,
      password: hashedAdminPassword,
      role: "ADMIN",
      status: "ACTIVE"
    }
  });

  // 3. Seed Test Customer User
  const customerEmail = "customer@fixitnow.com";
  const hashedCustomerPassword = await bcrypt.hash("Customer123!", 12);

  console.log(`Upserting test customer account: ${customerEmail}`);
  await prisma.user.upsert({
    where: { email: customerEmail },
    update: {},
    create: {
      name: "John Customer",
      email: customerEmail,
      password: hashedCustomerPassword,
      role: "CUSTOMER",
      status: "ACTIVE"
    }
  });

  // 4. Seed Test Technician User with Nested Profile
  const technicianEmail = "technician@fixitnow.com";
  const hashedTechnicianPassword = await bcrypt.hash("Technician123!", 12);

  console.log(`Upserting test technician account: ${technicianEmail}`);
  
  // Check if technician user already exists
  let existingTech = await prisma.user.findUnique({
    where: { email: technicianEmail },
    include: { technicianProfile: true }
  });

  if (!existingTech) {
    existingTech = await prisma.user.create({
      data: {
        name: "Bob Technician",
        email: technicianEmail,
        password: hashedTechnicianPassword,
        role: "TECHNICIAN",
        status: "ACTIVE",
        technicianProfile: {
          create: {
            bio: "Expert certified technician with over 5 years of plumbing and electrical experience.",
            skills: ["Wiring", "Troubleshooting", "Leak Repair", "Drain Cleaning"],
            experienceYears: 5,
            pricingRate: 45.00,
            availabilitySlots: ["Monday 09:00 - 17:00", "Wednesday 09:00 - 17:00", "Friday 09:00 - 17:00"]
          }
        }
      },
      include: { technicianProfile: true }
    });
  }

  // 5. Seed Services
  if (existingTech?.technicianProfile?.id) {
    console.log("Seeding services for technician...");
    const services = [
      {
        name: "Basic Leak Repair",
        description: "Fixing minor pipe leaks and dripping faucets quickly.",
        basePrice: 50.00,
        categoryId: createdCategories["Plumbing"],
        technicianId: existingTech.technicianProfile.id
      },
      {
        name: "Circuit Breaker Replacement",
        description: "Safe replacement of faulty electrical breakers.",
        basePrice: 85.00,
        categoryId: createdCategories["Electrical works"],
        technicianId: existingTech.technicianProfile.id
      },
      {
        name: "Deep Carpet Cleaning",
        description: "Professional steam cleaning for living room and bedroom carpets.",
        basePrice: 120.00,
        categoryId: createdCategories["Cleaning"],
        technicianId: existingTech.technicianProfile.id
      }
    ];

    for (const service of services) {
      // Find existing by name to prevent duplicates
      const existingService = await prisma.service.findFirst({
        where: { name: service.name, technicianId: service.technicianId }
      });
      if (!existingService) {
        await prisma.service.create({ data: service });
      }
    }
  }

  console.log("🌱 Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
