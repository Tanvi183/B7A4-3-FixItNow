import { prisma } from "./lib/prisma.js";

async function main() {
  console.log("Seeding locations...");
  
  const locations = [
    "New York City, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Houston, TX",
    "Phoenix, AZ",
    "Philadelphia, PA",
    "San Antonio, TX",
    "San Diego, CA",
    "Dallas, TX",
    "Austin, TX",
    "San Jose, CA",
    "San Francisco, CA",
    "Seattle, WA",
    "Denver, CO"
  ];

  for (const name of locations) {
    await prisma.location.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  
  console.log("Locations seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
