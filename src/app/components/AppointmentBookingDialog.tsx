import { useState } from "react";
import { Calendar as CalendarIcon, Clock, User, FileText, Stethoscope, Search, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { buildOfficeTimeSlots } from "@/lib/office-hours";
import type { Patient, Doctor } from "@/lib/types";
import { BookingDialogValues } from "@/lib/validations/appointment";

interface AppointmentBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (appointment: BookingDialogValues) => void;
  patients: Patient[];
  doctors: Doctor[];
}

export interface AppointmentData {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  duration: string;
  type: string;
  notes: string;
}

export default function AppointmentBookingDialog({ open, onClose, onSubmit, patients, doctors }: AppointmentBookingDialogProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [formData, setFormData] = useState<AppointmentData>({
    patientId: "",
    patientName: "",
    doctorId: "",
    doctorName: "",
    date: "",
    time: "",
    duration: "30",
    type: "",
    notes: "",
  });

  const appointmentTypes = [
    { value: "checkup", label: "General Checkup", duration: "30", icon: "🩺" },
    { value: "followup", label: "Follow-up Visit", duration: "15", icon: "🔄" },
    { value: "consultation", label: "Consultation", duration: "45", icon: "💬" },
    { value: "physical", label: "Annual Physical", duration: "60", icon: "📋" },
    { value: "lab", label: "Lab Results", duration: "15", icon: "🧪" },
    { value: "vaccination", label: "Vaccination", duration: "15", icon: "💉" },
  ];

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doctor.id.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const handlePatientSelect = (patient: Patient) => {
    setFormData({
      ...formData,
      patientId: patient.id,
      patientName: patient.name,
    });
    setStep(2);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setFormData({
      ...formData,
      doctorId: doctor.id,
      doctorName: doctor.name,
    });
    setStep(3);
  };

  const handleTypeSelect = (type: typeof appointmentTypes[0]) => {
    setFormData({
      ...formData,
      type: type.label,
      duration: type.duration,
    });
    setStep(4);
  };

  const getQuickDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split("T")[0];
  };

  const getQuickDateLabel = (daysFromNow: number) => {
    if (daysFromNow === 0) return "Today";
    if (daysFromNow === 1) return "Tomorrow";
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString("de-DE", { weekday: "short", month: "short", day: "numeric" });
  };

  const timeSlots = buildOfficeTimeSlots();

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }


    // Show success message (you could use a toast notification here)
    //alert(`Appointment scheduled!\n\nPatient: ${formData.patientName}\nDoctor: ${formData.doctorName}\nDate: ${new Date(formData.date).toLocaleDateString()}\nTime: ${formData.time}`);

    // Reset form
    setFormData({
      patientId: "",
      patientName: "",
      doctorId: "",
      doctorName: "",
      date: "",
      time: "",
      duration: "30",
      type: "",
      notes: "",
    });
    setStep(1);
    setPatientSearch("");
    setDoctorSearch("");

    onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to schedule appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetDialog = () => {
    setStep(1);
    setSubmitError(null);
    setIsSubmitting(false);
    setPatientSearch("");
    setDoctorSearch("");
    setFormData({
      patientId: "",
      patientName: "",
      doctorId: "",
      doctorName: "",
      date: "",
      time: "",
      duration: "30",
      type: "",
      notes: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={resetDialog}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>
            {step === 1 && "Select a patient to begin"}
            {step === 2 && "Choose the doctor"}
            {step === 3 && "Select appointment type"}
            {step === 4 && "Pick date and time"}
            {step === 5 && "Add notes (optional)"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`h-2 rounded-full flex-1 transition-all ${
                  s < step ? "bg-blue-600" : s === step ? "bg-blue-400" : "bg-slate-200"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step 1: Patient Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search patients by name or ID..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="w-full p-4 bg-white border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {patient.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{patient.name}</p>
                        <p className="text-sm text-slate-600">
                          {patient.id} • {patient.email}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  </div>
                </button>
              ))}
              {filteredPatients.length === 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No patients found for "{patientSearch}".
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Doctor Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              ← Back to Patient
            </Button>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-600">Patient: <span className="font-semibold text-slate-900">{formData.patientName}</span></p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search doctors by name, specialty, or ID..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
              {filteredDoctors.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => handleDoctorSelect(doctor)}
                  className="p-4 bg-white border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-white">
                        {doctor.name.split(" ").slice(-2).map(n => n[0]).join("").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{doctor.name}</p>
                      <p className="text-sm text-slate-600">{doctor.specialty}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  </div>
                </button>
              ))}
              {filteredDoctors.length === 0 && (
                <div className="col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No doctors found for "{doctorSearch}".
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Appointment Type */}
        {step === 3 && (
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => setStep(2)}>
              ← Back to Doctor
            </Button>
            <div className="p-3 bg-blue-50 rounded-lg space-y-1">
              <p className="text-sm text-slate-600">Patient: <span className="font-semibold text-slate-900">{formData.patientName}</span></p>
              <p className="text-sm text-slate-600">Doctor: <span className="font-semibold text-slate-900">{formData.doctorName}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {appointmentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeSelect(type)}
                  className="p-4 bg-white border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <p className="font-semibold text-slate-900 mb-1">{type.label}</p>
                  <p className="text-sm text-slate-600">{type.duration} minutes</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Date and Time */}
        {step === 4 && (
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => setStep(3)}>
              ← Back to Type
            </Button>
            <div className="p-3 bg-blue-50 rounded-lg space-y-1">
              <p className="text-sm text-slate-600">Patient: <span className="font-semibold text-slate-900">{formData.patientName}</span></p>
              <p className="text-sm text-slate-600">Type: <span className="font-semibold text-slate-900">{formData.type}</span> ({formData.duration} min)</p>
            </div>

            {/* Quick Date Selection */}
            <div>
              <Label className="mb-2 block">Quick Select</Label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 7].map((days) => (
                  <button
                    key={days}
                    onClick={() => setFormData({ ...formData, date: getQuickDate(days) })}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      formData.date === getQuickDate(days)
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{getQuickDateLabel(days)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date */}
            <div>
              <Label htmlFor="customDate">Or Choose Date</Label>
              <Input
                id="customDate"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className="mt-2"
              />
            </div>

            {/* Time Slots */}
            {formData.date && (
              <div>
                <Label className="mb-2 block">Available Time Slots</Label>
                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setFormData({ ...formData, time });
                        setStep(5);
                      }}
                      className="p-2 border-2 text-slate-900 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-sm font-medium"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Notes and Confirm */}
        {step === 5 && (
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => setStep(4)}>
              ← Back to Date/Time
            </Button>

            {submitError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {submitError}
              </div>
            ) : null}

            {/* Summary */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-3">Appointment Summary</p>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2 ">
                  <User className="w-4 h-4" />
                  <span className="text-slate-900"><strong>Patient:</strong> {formData.patientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  <span className="text-slate-900"><strong>Doctor:</strong> {formData.doctorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span  className="text-slate-900" ><strong>Type:</strong> {formData.type} ({formData.duration} min)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-slate-900"><strong>Date:</strong> {new Date(formData.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span><strong>Time:</strong> {formData.time}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions or notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={resetDialog} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Confirm & Schedule
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}