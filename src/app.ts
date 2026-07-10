import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./lib/prisma.js";
import { categoryRoutes } from "./modules/category/category.route.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { userRoutes } from "./modules/user/user.routes.js";
import { serviceRoutes } from "./modules/service/service.route.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { notFound } from "./middlewares/notFound.js";

const app: Application = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Hello check endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "FixItNow Backend Server is Running!"
  });
});

// Database connection test endpoint
app.get("/test-db", async (req: Request, res: Response) => {
  try {
    // Perform a raw connection check query
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: "Neon Database connected successfully!"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});



// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);

// Catch-all 404 handler
app.use(notFound);

// Centralized error boundary
app.use(globalErrorHandler);

export default app;
