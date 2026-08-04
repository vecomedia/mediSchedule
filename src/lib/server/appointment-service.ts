import {
  AppointmentStatus,
  Prisma,
  type Appointment,
  type PrismaClient,
} from "@prisma/client";

import type {
  CancelAppointmentInput,
  CreateAppointmentInput,
  RescheduleAppointmentInput,
  UpdateAppointmentInput,
} from "@/lib/validations/appointment-api";

export class AppointmentConflictError extends Error {
  constructor(message = "Requested slot conflicts with an existing appointment.") {
    super(message);
    this.name = "AppointmentConflictError";
  }
}

export class AppointmentNotFoundError extends Error {
  constructor(message = "Appointment not found.") {
    super(message);
    this.name = "AppointmentNotFoundError";
  }
}

function logRescheduleServiceDebug(...args: unknown[]) {
  console.log("[appointment-service:reschedule]", ...args);
}

function hasOverlap(input: { startAt: Date; endAt: Date }, existing: { startAt: Date; endAt: Date }) {
  return input.startAt < existing.endAt && input.endAt > existing.startAt;
}

async function findDoctorConflict(
  tx: Prisma.TransactionClient,
  params: {
    doctorId: string;
    startAt: Date;
    endAt: Date;
    excludeAppointmentId?: string;
  },
) {
  const entries = await tx.appointment.findMany({
    where: {
      doctorId: params.doctorId,
      status: {
        in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
      },
      ...(params.excludeAppointmentId
        ? {
            id: {
              not: params.excludeAppointmentId,
            },
          }
        : {}),
      startAt: {
        lt: params.endAt,
      },
      endAt: {
        gt: params.startAt,
      },
    },
    select: {
      id: true,
      startAt: true,
      endAt: true,
    },
    take: 1,
  });

  const candidate = entries[0];
  if (!candidate) {
    return null;
  }

  return hasOverlap({ startAt: params.startAt, endAt: params.endAt }, candidate)
    ? candidate
    : null;
}

export async function createAppointment(
  prisma: PrismaClient,
  input: CreateAppointmentInput,
  actorUserId: string,
  idempotencyKey?: string,
): Promise<Appointment> {
  return prisma.$transaction(async (tx) => {
    if (idempotencyKey) {
      const existingKey = await tx.appointmentIdempotency.findUnique({
        where: {
          key_userId: {
            key: idempotencyKey,
            userId: actorUserId,
          },
        },
        include: {
          appointment: true,
        },
      });

      if (existingKey?.appointment) {
        return existingKey.appointment;
      }
    }

    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);

    const conflict = await findDoctorConflict(tx, {
      doctorId: input.doctorId,
      startAt,
      endAt,
    });

    if (conflict) {
      throw new AppointmentConflictError();
    }

    const appointment = await tx.appointment.create({
      data: {
        patientId: input.patientId,
        doctorId: input.doctorId,
        createdByUserId: actorUserId,
        startAt,
        endAt,
        status: input.status ?? AppointmentStatus.PENDING,
        type: input.type,
        reason: input.reason,
        notes: input.notes,
      },
    });

    if (idempotencyKey) {
      await tx.appointmentIdempotency.create({
        data: {
          key: idempotencyKey,
          userId: actorUserId,
          appointmentId: appointment.id,
        },
      });
    }

    return appointment;
  });
}

export async function rescheduleAppointment(
  prisma: PrismaClient,
  appointmentId: string,
  input: RescheduleAppointmentInput,
): Promise<Appointment> {
  return prisma.$transaction(async (tx) => {
    logRescheduleServiceDebug("Starting reschedule transaction", {
      appointmentId,
      startAt: input.startAt,
      endAt: input.endAt,
    });

    const existing = await tx.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!existing) {
      logRescheduleServiceDebug("Appointment not found", { appointmentId });
      throw new AppointmentNotFoundError();
    }

    logRescheduleServiceDebug("Found existing appointment", {
      appointmentId,
      existingStartAt: existing.startAt,
      existingEndAt: existing.endAt,
      doctorId: existing.doctorId,
    });

    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);

    logRescheduleServiceDebug("Parsed dates", {
      appointmentId,
      parsedStartAt: startAt,
      parsedEndAt: endAt,
    });

    const conflict = await findDoctorConflict(tx, {
      doctorId: existing.doctorId,
      startAt,
      endAt,
      excludeAppointmentId: appointmentId,
    });

    if (conflict) {
      logRescheduleServiceDebug("Doctor conflict detected", {
        appointmentId,
        conflictId: conflict.id,
        conflictStart: conflict.startAt,
        conflictEnd: conflict.endAt,
      });
      throw new AppointmentConflictError();
    }

    logRescheduleServiceDebug("No conflict detected, updating appointment", {
      appointmentId,
      newStartAt: startAt,
      newEndAt: endAt,
    });

    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        startAt,
        endAt,
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
    });

    logRescheduleServiceDebug("Appointment updated successfully", {
      appointmentId,
      updatedStartAt: updated.startAt,
      updatedEndAt: updated.endAt,
    });

    return updated;
  });
}

export async function updateAppointment(
  prisma: PrismaClient,
  appointmentId: string,
  input: UpdateAppointmentInput,
): Promise<Appointment> {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });

  if (!appointment) {
    throw new AppointmentNotFoundError();
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.reason !== undefined ? { reason: input.reason } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
  });
}

export async function cancelAppointment(
  prisma: PrismaClient,
  appointmentId: string,
  input: CancelAppointmentInput,
): Promise<Appointment> {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });

  if (!appointment) {
    throw new AppointmentNotFoundError();
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: AppointmentStatus.CANCELLED,
      notes: input.reason,
    },
  });
}
