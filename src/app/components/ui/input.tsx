import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
	{ className, type = "text", ...props },
	ref,
) {
	return (
		<input
			className={cn(
				"flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors outline-none placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
				className,
			)}
			ref={ref}
			type={type}
			{...props}
		/>
	);
});