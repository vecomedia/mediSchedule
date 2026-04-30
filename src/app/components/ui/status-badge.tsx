import { Badge } from "@/app/components/ui/badge";
import type { AppointmentStatus } from "@/lib/types";

const statusClasses: Record<AppointmentStatus, string> = {
	confirmed: "bg-emerald-100 text-emerald-700",
	pending: "bg-amber-100 text-amber-700",
	cancelled: "bg-slate-200 text-slate-700",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
	return <Badge className={statusClasses[status]}>{status}</Badge>;
}