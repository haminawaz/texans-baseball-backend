import prisma from "../lib/prisma";
import logger from "../services/logger.service";

const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info("PostgreSQL database connected successfully via Prisma");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error connecting to PostgreSQL database: ${errorMessage}`);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  logger.info("Database connection closed through app termination");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  logger.info("Database connection closed through app termination");
  process.exit(0);
});

export default connectDB;
