// prisma/seed-doctors.ts
//
// Seeds the Doctor table with a handful of doctors so the patient
// booking dialog has data to show. Safe to re-run — it upserts on `name`
// is not possible (no unique constraint on name), so it checks first
// and skips doctors that already exist by name.

import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const doctors = [
  { name: "Dr. Sarah Chen", specialty: "Family Medicine" },
  { name: "Dr. James Okafor", specialty: "Internal Medicine" },
  { name: "Dr. Priya Nair", specialty: "Pediatrics" },
  { name: "Dr. Michael Reyes", specialty: "Cardiology" },
  { name: "Dr. Emily Bergström", specialty: "Dermatology" },
  { name: "Dr. Daniel Kim", specialty: "Orthopedics" },
  { name: "Dr. Laura Fischer", specialty: "OB/GYN" },
  { name: "Dr. Ahmed Hassan", specialty: "General Practice" },
];

async function main() {
  console.log("Seeding doctors...");

  for (const doctor of doctors) {
    const existing = await prisma.doctor.findFirst({
      where: { name: doctor.name },
    });

    if (existing) {
      console.log(`  - Skipping "${doctor.name}" (already exists)`);
      continue;
    }

    const created = await prisma.doctor.create({
      data: {
        name: doctor.name,
        specialty: doctor.specialty,
      },
    });

    console.log(`  + Created "${created.name}" (${created.specialty})`);
  }

  const count = await prisma.doctor.count();
  console.log(`Done. Doctor table now has ${count} record(s).`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });