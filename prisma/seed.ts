import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function main() {
  console.log("🌱 Start seeding database...");

  // 1. Seed Categories (Idempotent upsert)
  const categories = [
    { name: "Plumbing", slug: "plumbing", description: "Professional plumbing repairs, leak detection, and installations" },
    { name: "Electrical works", slug: "electrical-works", description: "Certified electrical troubleshooting, wiring, and fixture installs" },
    { name: "HVAC", slug: "hvac", description: "Heating, ventilation, and air conditioning services" },
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

  // 4. Seed Technicians based on frontend design
  const techniciansData = [
    {
      name: "Michael Chen",
      email: "michael@example.com",
      bio: "Master Electrician",
      skills: ["Wiring", "Smart Home"],
      pricingRate: 65,
      categoryId: createdCategories["Electrical works"],
      serviceName: "Professional Electrical Troubleshooting",
      serviceDesc: "Expert electrical wiring, panel upgrades, and smart home installations."
    },
    {
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      bio: "Senior Plumber",
      skills: ["Pipe Repair", "Heaters"],
      pricingRate: 55,
      categoryId: createdCategories["Plumbing"],
      serviceName: "Emergency Plumbing & Pipe Repair",
      serviceDesc: "Fast and reliable fixing of minor pipe leaks and dripping faucets."
    },
    {
      name: "David Wilson",
      email: "david@example.com",
      bio: "HVAC Specialist",
      skills: ["AC Repair", "Heating"],
      pricingRate: 75,
      categoryId: createdCategories["HVAC"],
      serviceName: "AC Repair & Servicing",
      serviceDesc: "Comprehensive HVAC maintenance and repair services."
    },
    {
      name: "Emily Davis",
      email: "emily@example.com",
      bio: "Professional Cleaner",
      skills: ["Deep Cleaning", "Move-in/out"],
      pricingRate: 35,
      categoryId: createdCategories["Cleaning"],
      serviceName: "Deep Home Cleaning",
      serviceDesc: "Professional steam cleaning for living room and bedroom carpets."
    }
  ];

  const defaultPassword = await bcrypt.hash("Technician123!", 12);
  
  for (const tech of techniciansData) {
    console.log(`Upserting technician account: ${tech.email}`);
    
    let user = await prisma.user.findUnique({
      where: { email: tech.email },
      include: { technicianProfile: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: tech.name,
          email: tech.email,
          password: defaultPassword,
          role: "TECHNICIAN",
          status: "ACTIVE",
          technicianProfile: {
            create: {
              bio: tech.bio,
              skills: tech.skills,
              experienceYears: 5,
              pricingRate: tech.pricingRate,
              availabilitySlots: ["Available Today", "Tomorrow", "Next Week"]
            }
          }
        },
        include: { technicianProfile: true }
      });
    }

    // 5. Seed Services for each technician
    if (user.technicianProfile && tech.categoryId) {
      const existingService = await prisma.service.findFirst({
        where: { name: tech.serviceName, technicianId: user.technicianProfile.id }
      });
      
      if (!existingService) {
        await prisma.service.create({
          data: {
            name: tech.serviceName,
            description: tech.serviceDesc,
            basePrice: tech.pricingRate,
            categoryId: tech.categoryId,
            technicianId: user.technicianProfile.id
          }
        });
      }
    }
  }

  // 6. Seed Reviews (Customers, Bookings, and Reviews)
  console.log("Seeding customer reviews...");

  const customerReviewsData = [
    {
      name: "Sarah Johnson",
      email: "sarah.customer@example.com",
      rating: 5,
      comment: "Amazing experience! The plumber arrived on time and fixed the issue quickly. Highly recommended!",
      technicianEmail: "sarah@example.com" // Sarah Jenkins is the Plumber
    },
    {
      name: "Michael Brown",
      email: "michael.customer@example.com",
      rating: 5,
      comment: "Booked an electrician through FixItNow and the service was top-notch. Will definitely use again!",
      technicianEmail: "michael@example.com" // Michael Chen is the Electrician
    },
    {
      name: "Emily Davis",
      email: "emily.customer@example.com",
      rating: 5,
      comment: "Great platform and excellent customer support. Got my AC repaired the same day!",
      technicianEmail: "david@example.com" // David Wilson is the AC Specialist
    }
  ];

  for (const reviewData of customerReviewsData) {
    // 6a. Create or get customer
    const customer = await prisma.user.upsert({
      where: { email: reviewData.email },
      update: {},
      create: {
        name: reviewData.name,
        email: reviewData.email,
        password: hashedCustomerPassword,
        role: "CUSTOMER",
        status: "ACTIVE"
      }
    });

    // 6b. Get the technician's service
    const technician = await prisma.user.findUnique({
      where: { email: reviewData.technicianEmail },
      include: { technicianProfile: { include: { services: true } } }
    });

    if (technician && technician.technicianProfile && technician.technicianProfile.services.length > 0) {
      const service = technician.technicianProfile.services[0]!;

      // 6c. Create a completed booking
      const booking = await prisma.booking.upsert({
        where: { 
          id: `seed-booking-${customer.id}-${service.id}` // Using a unique string if we could, but upsert needs a unique field. We'll use create instead or findFirst
        },
        update: {},
        create: {
          customerId: customer.id,
          serviceId: service.id,
          status: "COMPLETED",
          bookingDate: new Date(),
          timeSlot: "10:00 - 12:00",
          totalAmount: service.basePrice,
        }
      }).catch(async () => {
         // Fallback if upsert fails due to missing unique constraint on something else, let's just create if not exists
         const existing = await prisma.booking.findFirst({
            where: { customerId: customer.id, serviceId: service.id }
         });
         if (existing) return existing;
         return prisma.booking.create({
            data: {
              customerId: customer.id,
              serviceId: service.id,
              status: "COMPLETED",
              bookingDate: new Date(),
              timeSlot: "10:00 - 12:00",
              totalAmount: service.basePrice,
            }
         });
      });

      // 6d. Create the review
      if (booking) {
        const existingReview = await prisma.review.findUnique({
          where: { bookingId: booking.id }
        });
        
        if (!existingReview) {
          await prisma.review.create({
            data: {
              bookingId: booking.id,
              customerId: customer.id,
              rating: reviewData.rating,
              comment: reviewData.comment
            }
          });
          
          // Also update the technician's averageRating
          await prisma.technicianProfile.update({
            where: { id: technician.technicianProfile.id },
            data: { averageRating: 5.0 }
          });
        }
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
