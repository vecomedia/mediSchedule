"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { AppointmentStatus } from "@/lib/types";

type AppointmentActionButtonsProps = {
	appointmentId: string;
	currentStatus: AppointmentStatus;
};

export function AppointmentActionButtons({
	appointmentId,
	currentStatus,
}: AppointmentActionButtonsProps) {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const updateStatus = async (nextStatus: "CONFIRMED" | "CANCELLED") => {
		setIsPending(true);
		setError(null);

		try {
			const response = await fetch(`/api/appointments/${appointmentId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: nextStatus }),
			});

			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as { error?: string } | null;
				throw new Error(payload?.error ?? "Request failed.");
			}

			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<div className="flex items-center gap-2">
			{currentStatus !== "confirmed" && (
				<button
					disabled={isPending}
					onClick={() => updateStatus("CONFIRMED")}
					className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
				>
					Confirm
				</button>
			)}
			{currentStatus !== "cancelled" && (
				<button
					disabled={isPending}
					onClick={() => updateStatus("CANCELLED")}
					className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
				>
					Cancel
				</button>
			)}
			{error ? <span className="text-xs text-rose-600">{error}</span> : null}
		</div>
	);
}
