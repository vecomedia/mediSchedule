import { NextResponse } from "next/server";
import { AppointmentStatus, type Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  AppointmentConflictError,
  createAppointment,
} from "@/lib/server/appointment-service";
import { createAppointmentSchema } from "@/lib/validations/appointment-api";

function toRole(value: string | undefined) {
  switch (value) {
    case "admin":
      return "ADMIN";
    case "staff":
      return "STAFF";
    case "doctor":
      return "DOCTOR";
    case "patient":
      return "PATIENT";
    case "receptionist":
      return "RECEPTIONIST";
    default:
      return "STAFF";
  }
}

function toAppointmentStatus(value: string | null) {
  switch (value?.toUpperCase()) {
    case "PENDING":
      return AppointmentStatus.PENDING;
    case "CONFIRMED":
      return AppointmentStatus.CONFIRMED;
    case "CANCELLED":
      return AppointmentStatus.CANCELLED;
    default:
      return undefined;
  }
}

async function ensureActorUser(params: {
  sessionUserId: string;
  email?: string | null;
  name?: string | null;
  role: "ADMIN" | "STAFF" | "DOCTOR" | "PATIENT" | "RECEPTIONIST";
}) {
  const existingById = await prisma.user.findUnique({
    where: { id: params.sessionUserId },
    select: { id: true },
  });

  if (existingById) {
    return existingById.id;
  }

  if (!params.email) {
    return null;
  }

  const dbUser = await prisma.user.upsert({
    where: { email: params.email },
    update: {
      name: params.name ?? params.email,
      role: params.role,
    },
    create: {
      email: params.email,
      name: params.name ?? params.email,
      passwordHash: "dev-auth-user",
      role: params.role,
    },
    select: { id: true },
  });

  return dbUser.id;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const doctorId = searchParams.get("doctorId");
  const status = searchParams.get("status");
  const appointmentStatus = toAppointmentStatus(status);
  const role = toRole(session.user.role);
  const actorUserId = await ensureActorUser({
    sessionUserId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role,
  });

  const whereClause: Prisma.AppointmentWhereInput = {
    ...(doctorId ? { doctorId } : {}),
    ...(appointmentStatus ? { status: appointmentStatus } : {}),
    ...(from || to
      ? {
          startAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
    ...(role === "PATIENT"
      ? {
          patient: {
            OR: [
              ...(actorUserId ? [{ userId: actorUserId }] : []),
              ...(session.user.email ? [{ user: { email: session.user.email } }] : []),
            ],
          },
        }
      : {}),
  };

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    include: {
      doctor: true,
      patient: {
        include: {
          user: true,
        },
      },
    },
    orderBy: [{ startAt: "asc" }],
  });

  return NextResponse.json({ appointments });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = toRole(session.user.role);
  const body = await request.json();
  let actorUserId = await ensureActorUser({
    sessionUserId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role,
  });

  const parsed = createAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  let payload = parsed.data;

  if (!actorUserId) {
    return NextResponse.json({ error: "Authenticated user could not be resolved." }, { status: 403 });
  }

  if (role === "PATIENT") {
    let profile = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      const sessionEmail = session.user.email;
      if (!sessionEmail) {
        return NextResponse.json({ error: "Patient profile not found." }, { status: 403 });
      }

      actorUserId = await ensureActorUser({
        sessionUserId: session.user.id,
        email: sessionEmail,
        name: session.user.name,
        role: "PATIENT",
      });

      if (!actorUserId) {
        return NextResponse.json({ error: "Patient profile not found." }, { status: 403 });
      }

      profile = await prisma.patientProfile.upsert({
        where: { userId: actorUserId },
        update: {},
        create: {
          userId: actorUserId,
          status: "active",
        },
        select: { id: true },
      });
    }

    payload = {
      ...payload,
      patientId: profile.id,
      status: "PENDING",
    };
  }

  if (role !== "PATIENT" && role !== "STAFF" && role !== "ADMIN" && role !== "RECEPTIONIST") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const idempotencyKey = request.headers.get("idempotency-key") ?? undefined;

    const appointment = await createAppointment(
      prisma,
      payload,
      actorUserId,
      idempotencyKey,
    );

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    if (error instanceof AppointmentConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: "Unable to create appointment." }, { status: 500 });
  }
}
