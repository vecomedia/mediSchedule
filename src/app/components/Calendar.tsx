"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import StaffBookingDialog from "./StaffBookingDialog";
import type { AppointmentDetails, AppointmentStatus, Patient, Doctor } from "@/lib/types";

type ViewMode = "day" | "week";

interface CalendarAppointment {
  id: string;
  patient: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: AppointmentStatus;
  dayIndex: number;
  startHour: number;
}

type CalendarProps = {
  appointments: AppointmentDetails[];
  patients: Patient[];
  doctors: Doctor[];
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function startOfWeek(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDisplayTime(time: string) {
  const [rawHour, rawMinute] = time.split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

function estimateDuration(reason: string) {
  const normalized = reason.toLowerCase();

  if (normalized.includes("annual") || normalized.includes("physical")) {
    return 60;
  }

  if (normalized.includes("consultation") || normalized.includes("specialist")) {
    return 45;
  }

  if (normalized.includes("lab") || normalized.includes("vaccination")) {
    return 15;
  }

  return 30;
}

function mapAppointmentsToWeek(
  source: AppointmentDetails[],
  weekStart: Date,
): CalendarAppointment[] {
  const weekEnd = addDays(weekStart, 7);
  const msPerDay = 24 * 60 * 60 * 1000;

  return source
    .filter((appointment) => {
      const appointmentDate = new Date(`${appointment.date}T00:00:00`);
      return appointmentDate >= weekStart && appointmentDate < weekEnd;
    })
    .map((appointment) => {
      const start = parseDateTime(appointment.date, appointment.time);
      const duration = estimateDuration(appointment.reason);
      const end = new Date(start.getTime() + duration * 60 * 1000);
      const appointmentDate = new Date(`${appointment.date}T00:00:00`);
      const dayIndex = Math.floor((appointmentDate.getTime() - weekStart.getTime()) / msPerDay);

      return {
        id: appointment.id,
        patient: appointment.patient.name,
        type: appointment.reason,
        date: appointment.date,
        startTime: formatDisplayTime(appointment.time),
        endTime: end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        duration,
        status: appointment.status,
        dayIndex,
        startHour: start.getHours() + start.getMinutes() / 60,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour);
}

export default function Calendar({ appointments, patients, doctors }: CalendarProps) {
  const firstAppointmentDate = appointments[0]
    ? parseDateTime(appointments[0].date, appointments[0].time)
    : new Date();

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(firstAppointmentDate);
  const [selectedDay, setSelectedDay] = useState(firstAppointmentDate.getDay());

  const weekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );
  const calendarAppointments = useMemo(
    () => mapAppointmentsToWeek(appointments, weekStart),
    [appointments, weekStart],
  );

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return { bg: "bg-emerald-100", border: "border-emerald-500", text: "text-emerald-900", dot: "bg-emerald-500" };
      case "pending":
        return { bg: "bg-amber-100", border: "border-amber-500", text: "text-amber-900", dot: "bg-amber-500" };
      case "cancelled":
        return { bg: "bg-slate-100", border: "border-slate-400", text: "text-slate-600", dot: "bg-slate-400" };
    }
  };

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const renderAppointmentCard = (apt: CalendarAppointment, isCompact = false) => {
    const colors = getStatusColor(apt.status);

    if (isCompact) {
      return (
        <div
          key={apt.id}
          className={`${colors.bg} ${colors.border} border-l-3 rounded p-2 mb-1 cursor-pointer hover:shadow-sm transition-shadow`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${colors.text} truncate`}>{apt.patient}</p>
              <p className="text-xs text-slate-600 truncate">{apt.type}</p>
            </div>
            <div className={`w-1.5 h-1.5 ${colors.dot} rounded-full mt-1 flex-shrink-0`} />
          </div>
          <p className="text-xs text-slate-500 mt-1">{apt.startTime}</p>
        </div>
      );
    }

    return (
      <div
        key={apt.id}
        className={`${colors.bg} ${colors.border} border-l-4 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className={`font-semibold ${colors.text} mb-1`}>{apt.patient}</p>
            <p className="text-sm text-slate-600">{apt.type}</p>
          </div>
          <span className={`px-2 py-0.5 ${colors.dot} text-white text-xs rounded-full`}>
            {apt.status}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-slate-600">
          <Clock className="w-3.5 h-3.5" />
          <span>{apt.startTime} - {apt.endTime}</span>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        {/* Day Headers */}
        <div className="grid grid-cols-8 bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
          <div className="p-4 text-sm font-medium text-slate-600">Time</div>
          {DAYS_OF_WEEK.map((day, idx) => {
            const dayDate = weekDates[idx];
            const isToday = dayDate.toDateString() === new Date().toDateString();
            return (
              <div key={idx} className="p-4 text-center border-l border-slate-200">
                <div className="text-xs text-slate-600 mb-1">{day}</div>
                <div
                  className={`text-lg font-semibold ${
                    isToday ? "text-blue-600" : "text-slate-900"
                  }`}
                >
                  {dayDate.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Slots */}
        <div className="grid grid-cols-8 relative">
          {HOURS.map((hour) => (
            <div key={hour} className="contents">
              <div className="p-4 text-sm text-slate-600 border-b border-slate-200 bg-slate-50/50 sticky left-0">
                {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              {DAYS_OF_WEEK.map((_, dayIdx) => {
                const dayAppointments = calendarAppointments.filter(
                  (a) => a.dayIndex === dayIdx && a.startHour >= hour && a.startHour < hour + 1
                );
                return (
                  <div
                    key={dayIdx}
                    className="p-2 border-b border-l border-slate-200 min-h-[80px] hover:bg-slate-50/50 transition-colors relative"
                  >
                    {dayAppointments.map((apt) => renderAppointmentCard(apt, true))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const selectedDate = weekDates[selectedDay];
    const dayAppointments = calendarAppointments.filter((a) => a.dayIndex === selectedDay);
    const selectedDayName = DAYS_OF_WEEK[selectedDay];
    const selectedDayDate = selectedDate.getDate();

    return (
      <div className="grid grid-cols-12 gap-6">
        {/* Time Column */}
        <div className="col-span-3 border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div className="bg-slate-50 border-b border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900">
              {selectedDayName}, {selectedDate.toLocaleDateString("en-US", { month: "short" })} {selectedDayDate}
            </h3>
            <p className="text-sm text-slate-600">{dayAppointments.length} appointments</p>
          </div>
          <div className="p-2">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="p-3 text-sm text-slate-600 border-b border-slate-100 last:border-0"
              >
                {hour === 12 ? "12:00 PM" : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
              </div>
            ))}
          </div>
        </div>

        {/* Appointments Column */}
        <div className="col-span-9 space-y-3">
          {dayAppointments.length === 0 ? (
            <div className="border border-slate-200 rounded-lg p-12 text-center bg-white">
              <p className="text-slate-500">No appointments scheduled for this day</p>
            </div>
          ) : (
            dayAppointments
              .sort((a, b) => a.startHour - b.startHour)
              .map((apt) => renderAppointmentCard(apt, false))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Calendar</h1>
          <p className="text-slate-600">Manage appointments and availability</p>
        </div>
        <StaffBookingDialog patients={patients} doctors={doctors} />
      </div>

      {/* Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate((prev) => addDays(prev, -7))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-lg font-semibold text-slate-900 min-w-[200px] text-center">
            {monthName}
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate((prev) => addDays(prev, 7))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              setCurrentDate(today);
              setSelectedDay(today.getDay());
            }}
          >
            Today
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Legend */}
      <div className="mb-6 flex items-center gap-6 p-4 bg-white border border-slate-200 rounded-lg">
        <span className="text-sm font-medium text-slate-700">Status:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span className="text-sm text-slate-600">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
          <span className="text-sm text-slate-600">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-400 rounded-full" />
          <span className="text-sm text-slate-600">Cancelled</span>
        </div>
      </div>

      {/* Day Selector (only in day view) */}
      {viewMode === "day" && (
        <div className="mb-6 flex gap-2">
          {DAYS_OF_WEEK.map((day, idx) => {
            const isSelected = idx === selectedDay;
            const dayDate = weekDates[idx];
            const isToday = dayDate.toDateString() === new Date().toDateString();
            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(idx)}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-xs text-slate-600 mb-1">{day}</div>
                <div
                  className={`text-lg font-semibold ${
                    isToday ? "text-blue-600" : "text-slate-900"
                  }`}
                >
                  {dayDate.getDate()}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "week" ? renderWeekView() : renderDayView()}

    </div>
  );
}
