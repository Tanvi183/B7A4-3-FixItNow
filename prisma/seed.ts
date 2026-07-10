import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function main() {
  console.log("🌱 Start seeding database...");

  // 1. Seed Categories (Idempotent upsert)
  const categories = [
    { name: "Plumbing", slug: "plumbing", description: "Professional plumbing repairs, leak detection, and installations" },
    { name: "Electrical", slug: "electrical", description: "Certified electrical troubleshooting, wiring, and fixture installs" },
    { name: "Cleaning", slug: "cleaning", description: "Deep home and office sanitization and cleaning services" },
    { name: "Painting", slug: "painting", description: "High-quality residential and commercial painting" }
  ];

  console.log("Creating categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
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
  const existingTech = await prisma.user.findUnique({
    where: { email: technicianEmail }
  });

  if (!existingTech) {
    await prisma.user.create({
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
      }
    });
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
