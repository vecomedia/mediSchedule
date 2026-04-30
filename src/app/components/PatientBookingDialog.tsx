import { useState } from "react";
import { Calendar as CalendarIcon, Clock, FileText, Stethoscope, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";

interface PatientBookingDialogProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  onSubmit?: (appointment: AppointmentData) => void;
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

export default function PatientBookingDialog({
  open,
  onClose,
  patientId,
  patientName,
  onSubmit,
}: PatientBookingDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AppointmentData>({
    patientId,
    patientName,
    doctorId: "",
    doctorName: "",
    date: "",
    time: "",
    duration: "30",
    type: "",
    notes: "",
  });

  const doctors = [
    { id: "D-001", name: "Dr. Sarah Smith", specialty: "General Practice", avatar: "SS" },
    { id: "D-002", name: "Dr. John Williams", specialty: "Cardiology", avatar: "JW" },
    { id: "D-003", name: "Dr. Emily Chen", specialty: "Pediatrics", avatar: "EC" },
    { id: "D-004", name: "Dr. Michael Brown", specialty: "Orthopedics", avatar: "MB" },
  ];

  const appointmentTypes = [
    { value: "checkup", label: "General Checkup", duration: "30", icon: "🩺" },
    { value: "followup", label: "Follow-up Visit", duration: "20", icon: "🔄" },
    { value: "consultation", label: "Consultation", duration: "45", icon: "💬" },
    { value: "physical", label: "Annual Physical", duration: "60", icon: "📋" },
    { value: "lab", label: "Lab Results", duration: "15", icon: "🧪" },
    { value: "vaccination", label: "Vaccination", duration: "15", icon: "💉" },
  ];

  const handleDoctorSelect = (doctor: typeof doctors[0]) => {
    setFormData({
      ...formData,
      doctorId: doctor.id,
      doctorName: doctor.name,
    });
    setStep(2);
  };

  const handleTypeSelect = (type: typeof appointmentTypes[0]) => {
    setFormData({
      ...formData,
      type: type.label,
      duration: type.duration,
    });
    setStep(3);
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
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
  ];

  const handleSubmit = () => {
    console.log("Booking appointment:", formData);

    if (onSubmit) {
      onSubmit(formData);
    }

    alert(`Appointment request submitted!\n\nDoctor: ${formData.doctorName}\nType: ${formData.type}\nDate: ${new Date(formData.date).toLocaleDateString()}\nTime: ${formData.time}\n\nYou will receive a confirmation email shortly.`);

    setFormData({
      patientId,
      patientName,
      doctorId: "",
      doctorName: "",
      date: "",
      time: "",
      duration: "30",
      type: "",
      notes: "",
    });
    setStep(1);
    onClose();
  };

  const resetDialog = () => {
    setStep(1);
    setFormData({
      patientId,
      patientName,
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
          <DialogTitle>Book Your Appointment</DialogTitle>
          <DialogDescription>
            {step === 1 && "Choose your doctor"}
            {step === 2 && "Select appointment type"}
            {step === 3 && "Pick date and time"}
            {step === 4 && "Add notes (optional)"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`h-2 rounded-full flex-1 transition-all ${
                  s < step ? "bg-blue-600" : s === step ? "bg-blue-400" : "bg-slate-200"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step 1: Doctor Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-600">Booking for: <span className="font-semibold text-slate-900">{patientName}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {doctors.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => handleDoctorSelect(doctor)}
                  className="p-4 bg-white border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-white">{doctor.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{doctor.name}</p>
                      <p className="text-sm text-slate-600">{doctor.specialty}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Appointment Type */}
        {step === 2 && (
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              ← Back to Doctor
            </Button>
            <div className="p-3 bg-blue-50 rounded-lg">
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

        {/* Step 3: Date and Time */}
        {step === 3 && (
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => setStep(2)}>
              ← Back to Type
            </Button>
            <div className="p-3 bg-blue-50 rounded-lg space-y-1">
              <p className="text-sm text-slate-600">Doctor: <span className="font-semibold text-slate-900">{formData.doctorName}</span></p>
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
                        setStep(4);
                      }}
                      className="p-2 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-sm font-medium"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Notes and Confirm */}
        {step === 4 && (
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => setStep(3)}>
              ← Back to Date/Time
            </Button>

            {/* Summary */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-3">Appointment Summary</p>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  <span><strong>Doctor:</strong> {formData.doctorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span><strong>Type:</strong> {formData.type} ({formData.duration} min)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span><strong>Date:</strong> {new Date(formData.date).toLocaleDateString("en-US", {
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
                placeholder="Any symptoms or concerns you'd like to discuss..."
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
                Request Appointment
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
