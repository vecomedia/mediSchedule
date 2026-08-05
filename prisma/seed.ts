import { faker } from "@faker-js/faker";
import { AppointmentStatus, PrismaClient, UserRole } from "@prisma/client";

import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

faker.seed(42);

async function main() {
  await prisma.appointmentIdempotency.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.user.deleteMany();

  const staffUser = await prisma.user.create({
    data: {
      email: "staff@medi.dev",
      name: "Sam Rivera",
      passwordHash: "password123",
      role: UserRole.STAFF,
      phone: "+1-555-0100",
    },
  });

  const doctorUsers = await Promise.all(
    Array.from({ length: 6 }, (_, index) =>
      prisma.user.create({
        data: {
          email: `doctor${index + 1}@medi.dev`,
          name: `Dr. ${faker.person.fullName()}`,
          passwordHash: "password123",
          role: UserRole.DOCTOR,
        },
      }),
    ),
  );

  const doctors = await Promise.all(
    doctorUsers.map((user, index) =>
      prisma.doctor.create({
        data: {
          userId: user.id,
          name: user.name,
          specialty: faker.helpers.arrayElement([
            "General Medicine",
            "Cardiology",
            "Dermatology",
            "Neurology",
            "Pediatrics",
            "Orthopedics",
          ]),
          avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}-${index}`,
        },
      }),
    ),
  );

  const patientUsers = await Promise.all(
    Array.from({ length: 20 }, (_, index) =>
      prisma.user.create({
        data: {
          email: `patient${index + 1}@medi.dev`,
          name: faker.person.fullName(),
          passwordHash: "password123",
          role: UserRole.PATIENT,
          phone: faker.phone.number({ style: "international" }),
        },
      }),
    ),
  );

  const patients = await Promise.all(
    patientUsers.map((user) =>
      prisma.patientProfile.create({
        data: {
          userId: user.id,
          dateOfBirth: faker.date.birthdate({ min: 1948, max: 2018, mode: "year" }),
          status: faker.helpers.arrayElement(["active", "active", "new", "inactive"]),
        },
      }),
    ),
  );

  const base = new Date();
  base.setHours(8, 0, 0, 0);

  await Promise.all(
    Array.from({ length: 50 }, () => {
      const patient = faker.helpers.arrayElement(patients);
      const doctor = faker.helpers.arrayElement(doctors);
      const dayOffset = faker.number.int({ min: 0, max: 28 });
      const slotOffset = faker.number.int({ min: 0, max: 18 });
      const startAt = new Date(base);
      startAt.setDate(startAt.getDate() + dayOffset);
      startAt.setMinutes(startAt.getMinutes() + slotOffset * 30);

      const durationMinutes = faker.helpers.arrayElement([15, 20, 30, 45, 60]);
      const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000);

      return prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          createdByUserId: staffUser.id,
          startAt,
          endAt,
          status: faker.helpers.arrayElement([
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.PENDING,
            AppointmentStatus.CANCELLED,
          ]),
          type: faker.helpers.arrayElement([
            "General Checkup",
            "Follow-up Visit",
            "Consultation",
            "Annual Physical",
            "Lab Results",
            "Vaccination",
          ]),
          reason: faker.helpers.arrayElement([
            "Routine check-up",
            "Prescription review",
            "Lab review",
            "Follow-up consultation",
            "Vaccination",
          ]),
          notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
        },
      });
    }),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
