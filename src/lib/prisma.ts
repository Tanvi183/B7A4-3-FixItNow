import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import pg from "pg";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

// Create a new pg Pool with SSL support for remote databases and pass it to the PrismaPg adapter
const pool = new pg.Pool({ 
  connectionString,
  ssl: connectionString.includes("neon.tech") ? { rejectUnauthorized: false } : false
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };
