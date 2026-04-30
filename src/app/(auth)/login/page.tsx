"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";

export default function LoginPage() {
	const router = useRouter();
	const [role, setRole] = useState<"staff" | "patient">("patient");
	const [authError, setAuthError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const form = useForm<LoginValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "patient@medi.dev",
			password: "password123",
		},
	});

	const applyRolePreset = (nextRole: "staff" | "patient") => {
		setRole(nextRole);
		setAuthError(null);
		form.setValue("email", nextRole === "staff" ? "staff@medi.dev" : "patient@medi.dev", {
			shouldValidate: true,
		});
		form.setValue("password", "password123", { shouldValidate: true });
	};

	const onSubmit = form.handleSubmit((values) => {
		setAuthError(null);

		startTransition(async () => {
			const result = await signIn("credentials", {
				...values,
				redirect: false,
				callbackUrl: role === "patient" ? "/patient-dashboard" : "/dashboard",
			});

			if (!result || result.error) {
				setAuthError("Invalid email or password.");
				return;
			}

			router.push(result.url ?? "/dashboard");
			router.refresh();
		});
	});

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
			<Card className="w-full max-w-md border-blue-100 shadow-xl shadow-blue-950/5">
				<CardHeader className="space-y-4 text-center">
					<div className="flex justify-center">
						<div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
							<Activity className="w-10 h-10 text-white" />
						</div>
					</div>
					<div>
						<CardTitle className="text-2xl">Welcome to MediSchedule</CardTitle>
						<CardDescription>Sign in to access your account</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={onSubmit}>
						<div className="grid grid-cols-2 gap-3 mb-4">
							<button
								type="button"
								onClick={() => applyRolePreset("patient")}
								className={`p-4 rounded-lg border-2 transition-all ${
									role === "patient"
										? "border-blue-600 bg-blue-50 text-blue-700"
										: "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
								}`}
							>
								<div className="font-semibold">Patient</div>
								<div className="text-xs mt-1">View appointments</div>
							</button>
							<button
								type="button"
								onClick={() => applyRolePreset("staff")}
								className={`p-4 rounded-lg border-2 transition-all ${
									role === "staff"
										? "border-blue-600 bg-blue-50 text-blue-700"
										: "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
								}`}
							>
								<div className="font-semibold">Staff</div>
								<div className="text-xs mt-1">Manage clinic</div>
							</button>
						</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
									<Input
										id="email"
										type="email"
										autoComplete="email"
										className="pl-10"
										{...form.register("email")}
									/>
								</div>
								{form.formState.errors.email ? (
									<p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
								) : null}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
									<Input
										id="password"
										type="password"
										autoComplete="current-password"
										className="pl-10"
										{...form.register("password")}
									/>
								</div>
								{form.formState.errors.password ? (
									<p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
								) : null}
							</div>

							{authError ? (
								<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
									{authError}
								</div>
							) : null}

							<Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" type="submit" disabled={isPending}>
								{isPending ? "Signing in..." : "Sign In"}
							</Button>

							<div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
								Demo login: staff@medi.dev / password123 or patient@medi.dev / password123
							</div>
						</form>
				</CardContent>
			</Card>
		</div>
	);
}