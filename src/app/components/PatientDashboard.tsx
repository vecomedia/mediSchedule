
"use client";

import { useState } from "react";
import { Calendar, Clock, User, LogOut, Plus } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import PatientBookingDialog from "./PatientBookingDialog";
import type { AppointmentDetails } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTime(value: string) {
  const [rawHour, rawMinute] = value.split(":");
  const hour = Number(rawHour);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${rawMinute} ${period}`;
}

type PatientDashboardProps = {
  appointments: AppointmentDetails[];
};

export default function PatientDashboard({ appointments }: PatientDashboardProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const upcomingAppointment = appointments[0] ?? null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900">MediSchedule</h1>
              <p className="text-xs text-slate-500">Patient Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h2>
          <p className="text-slate-600">Manage your appointments and health records</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Upcoming</p>
                  <p className="text-3xl font-semibold text-slate-900">
                    {appointments.filter((a) => a.status === "confirmed").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Pending</p>
                  <p className="text-3xl font-semibold text-slate-900">
                    {appointments.filter((a) => a.status === "pending").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <CardContent className="p-6">
              <p className="text-sm text-blue-100 mb-3">Need to see a doctor?</p>
              <Button
                className="w-full text-blue-700 hover:bg-blue-50"
                onClick={() => setBookingDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Next Appointment */}
        <Card className="mb-6 border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle className="text-lg">Next Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointment === null ? (
              <p className="text-slate-500 text-sm">No upcoming appointments.</p>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{formatDate(upcomingAppointment.date)}</span>
                  <span>at</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span className="font-medium">{formatTime(upcomingAppointment.time)}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {upcomingAppointment.reason}
                </h3>
                <p className="text-slate-600 mb-1">with {upcomingAppointment.doctor.name}</p>
                <p className="text-sm text-slate-500">{upcomingAppointment.doctor.specialty}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex-1">
                  Reschedule
                </Button>
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  View Details
                </Button>
              </div>
            </div>
            )}
          </CardContent>
        </Card>

        {/* All Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Appointments</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">No appointments found.</p>
              ) : appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-slate-900">{apt.reason}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            apt.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : apt.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">with {apt.doctor.name}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(apt.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTime(apt.time)}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Booking Dialog */}
      <PatientBookingDialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        patientId={user?.id || ""}
        patientName={user?.name || ""}
      />
    </div>
  );
}
