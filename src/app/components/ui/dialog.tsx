import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="fixed inset-0 bg-black/40"
				onClick={() => onOpenChange(false)}
				aria-hidden="true"
			/>
			<div className="relative z-50 w-full max-w-lg">{children}</div>
		</div>
	);
}

export function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("rounded-xl bg-white shadow-xl p-6 mx-4", className)}
			{...props}
		>
			{children}
		</div>
	);
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("mb-4 space-y-1", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
	return <h2 className={cn("text-lg font-semibold text-slate-900", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
	return <p className={cn("text-sm text-slate-500", className)} {...props} />;
}

type DialogCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function DialogClose({ className, ...props }: DialogCloseProps) {
	return (
		<button
			className={cn(
				"absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors",
				className,
			)}
			aria-label="Close"
			{...props}
		>
			<X className="w-5 h-5" />
		</button>
	);
}
