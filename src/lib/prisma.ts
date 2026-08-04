import { PrismaClient } from "@prisma/client";
import { config as loadDotenv } from "dotenv";

if (!process.env.DATABASE_URL) {
  loadDotenv({ path: ".env.local" });
  loadDotenv({ path: ".env" });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
