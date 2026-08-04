import { NextResponse } from "next/server";
import { AppointmentStatus } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  AppointmentConflictError,
  AppointmentNotFoundError,
  cancelAppointment,
  rescheduleAppointment,
  updateAppointment,
} from "@/lib/server/appointment-service";
import {
  cancelAppointmentSchema,
  rescheduleAppointmentSchema,
  updateAppointmentSchema,
} from "@/lib/validations/appointment-api";

function hasWriteAccess(role: string | undefined) {
  return role === "admin" || role === "staff" || role === "receptionist" || role === "patient";
}

function logRescheduleApiDebug(...args: unknown[]) {
  console.log("[api:appointments:reschedule]", ...args);
}

async function getOwnedAppointmentIdForPatient(
  userId: string,
  userEmail: string | undefined,
  appointmentId: string,
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      id: true,
      patient: {
        select: {
          userId: true,
          user: {
            select: { email: true },
          },
        },
      },
    },
  });

  if (!appointment) {
    return null;
  }

  const ownsById = appointment.patient.userId === userId;
  const ownsByEmail = userEmail != null && appointment.patient.user.email === userEmail;

  if (!ownsById && !ownsByEmail) {
    return false;
  }

  return appointment.id;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasWriteAccess(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { appointmentId } = await params;

  if (session.user.role === "patient") {
    const ownedAppointmentId = await getOwnedAppointmentIdForPatient(session.user.id, session.user.email ?? undefined, appointmentId);

    if (ownedAppointmentId === null) {
      return NextResponse.json({ error: "Appointment was not found." }, { status: 404 });
    }

    if (ownedAppointmentId === false) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const body = await request.json();

  const mode = body?.mode as string | undefined;

  logRescheduleApiDebug("PATCH request received", {
    appointmentId,
    mode,
    role: session.user.role,
    userId: session.user.id,
  });

  try {
    if (mode === "reschedule") {
      logRescheduleApiDebug("Reschedule mode payload", {
        appointmentId,
        startAt: body?.startAt,
        endAt: body?.endAt,
      });

      const parsed = rescheduleAppointmentSchema.safeParse(body);
      if (!parsed.success) {
        const errors = parsed.error.flatten();
        const firstError = errors.fieldErrors ? Object.values(errors.fieldErrors).flat()[0] : errors.formErrors?.[0];
        logRescheduleApiDebug("Reschedule payload validation failed", {
          appointmentId,
          details: errors,
          firstError,
        });
        return NextResponse.json({
          error: firstError || "Invalid appointment times. Check that times are within office hours (7 AM - 5 PM) and aligned to 30-minute slots.",
          details: errors,
        }, { status: 400 });
      }

      let appointment = await rescheduleAppointment(prisma, appointmentId, parsed.data);
      if (session.user.role === "patient") {
        appointment = await prisma.appointment.update({
          where: { id: appointmentId },
          data: { status: AppointmentStatus.PENDING },
        });
      }
      logRescheduleApiDebug("Reschedule succeeded", {
        appointmentId,
        updatedStartAt: appointment.startAt,
        updatedEndAt: appointment.endAt,
      });
      return NextResponse.json({ appointment });
    }

    if (mode === "cancel") {
      const parsed = cancelAppointmentSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
      }

      const appointment = await cancelAppointment(prisma, appointmentId, parsed.data);
      return NextResponse.json({ appointment });
    }

    const parsed = updateAppointmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
    }

    const appointment = await updateAppointment(prisma, appointmentId, parsed.data);
    return NextResponse.json({ appointment });
  } catch (error) {
    if (error instanceof AppointmentNotFoundError) {
      logRescheduleApiDebug("PATCH failed: appointment not found", {
        appointmentId,
        mode,
        error: error.message,
      });
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof AppointmentConflictError) {
      logRescheduleApiDebug("PATCH failed: appointment conflict", {
        appointmentId,
        mode,
        error: error.message,
      });
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    logRescheduleApiDebug("PATCH failed: unexpected error", {
      appointmentId,
      mode,
      error,
    });

    return NextResponse.json({ error: "Unable to update appointment." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasWriteAccess(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { appointmentId } = await params;

  if (session.user.role === "patient") {
    const ownedAppointmentId = await getOwnedAppointmentIdForPatient(session.user.id, session.user.email ?? undefined, appointmentId);

    if (ownedAppointmentId === null) {
      return NextResponse.json({ error: "Appointment was not found." }, { status: 404 });
    }

    if (ownedAppointmentId === false) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const appointment = await cancelAppointment(prisma, appointmentId, {
      reason: "Cancelled by user action.",
    });
    return NextResponse.json({ appointment });
  } catch (error) {
    if (error instanceof AppointmentNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Unable to delete appointment." }, { status: 500 });
  }
}
