import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
	default:
		"bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-600 disabled:bg-slate-300 disabled:text-slate-500",
	outline:
		"border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400 disabled:border-slate-200 disabled:text-slate-400",
	ghost:
		"bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400 disabled:text-slate-400",
};

const sizeClasses: Record<ButtonSize, string> = {
	default: "h-10 px-4 py-2 text-sm",
	sm: "h-9 rounded-md px-3 text-sm",
	lg: "h-11 rounded-md px-6 text-base",
	
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ className, variant = "default", size = "default", type = "button", ...props },
	ref,
) {
	return (
		<button
			className={cn(
				"inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none",
				variantClasses[variant],
				sizeClasses[size],
				className,
			)}
			ref={ref}
			type={type}
			{...props}
		/>
	);
});