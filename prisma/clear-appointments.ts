import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const confirmed = process.argv.includes("--yes");

  if (!confirmed) {
    console.log("Safety check: this command deletes all appointments.");
    console.log("Run again with --yes to confirm:");
    console.log("npm run prisma:clear:appointments -- --yes");
    return;
  }

  const [idempotencyResult, appointmentsResult] = await prisma.$transaction([
    prisma.appointmentIdempotency.deleteMany(),
    prisma.appointment.deleteMany(),
  ]);

  console.log(`Deleted ${idempotencyResult.count} appointment idempotency entries.`);
  console.log(`Deleted ${appointmentsResult.count} appointments.`);
}

main()
  .catch((error) => {
    console.error("Failed to clear appointments:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
