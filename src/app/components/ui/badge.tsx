import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
				"bg-slate-100 text-slate-700",
				className,
			)}
			{...props}
		/>
	);
}