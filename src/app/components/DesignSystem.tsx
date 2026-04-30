import { AlertCircle, Check, Heart, Info } from "lucide-react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function DesignSystem() {
	return (
		<div className="min-h-screen bg-slate-50 p-8">
			<div className="mx-auto max-w-6xl space-y-12">
				<div>
					<h1 className="mb-2 text-4xl font-bold text-slate-900">MediSchedule Design System</h1>
					<p className="text-lg text-slate-600">Professional healthcare interface components</p>
				</div>

				<section>
					<h2 className="mb-6 text-2xl font-semibold text-slate-900">Color Palette</h2>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Primary - Trust & Reliability</CardTitle>
								<CardDescription>Main brand color for primary actions</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{[
									["blue-50", "#eff6ff", "bg-blue-50 border border-blue-200", ""],
									["blue-100", "#dbeafe", "bg-blue-100", ""],
									["blue-600", "#2563eb", "bg-blue-600", "text-white"],
									["blue-700", "#1d4ed8", "bg-blue-700", "text-white"],
								].map(([name, hex, swatchClass, textClass]) => (
									<div className="flex items-center gap-3" key={name}>
										<div className={`h-16 w-16 rounded-lg ${swatchClass}`} />
										<div>
											<p className={`font-mono text-sm font-medium ${textClass}`}>{name}</p>
											<p className="text-xs text-slate-600">{hex}</p>
										</div>
									</div>
								))}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Success - Confirmed & Healthy</CardTitle>
								<CardDescription>Positive states and confirmations</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{[
									["emerald-50", "#ecfdf5", "bg-emerald-50 border border-emerald-200", ""],
									["emerald-100", "#d1fae5", "bg-emerald-100", ""],
									["emerald-500", "#10b981", "bg-emerald-500", "text-white"],
									["emerald-700", "#047857", "bg-emerald-700", "text-white"],
								].map(([name, hex, swatchClass, textClass]) => (
									<div className="flex items-center gap-3" key={name}>
										<div className={`h-16 w-16 rounded-lg ${swatchClass}`} />
										<div>
											<p className={`font-mono text-sm font-medium ${textClass}`}>{name}</p>
											<p className="text-xs text-slate-600">{hex}</p>
										</div>
									</div>
								))}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Warning - Pending & Caution</CardTitle>
								<CardDescription>Pending states and attention needed</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{[
									["amber-50", "#fffbeb", "bg-amber-50 border border-amber-200", ""],
									["amber-100", "#fef3c7", "bg-amber-100", ""],
									["amber-500", "#f59e0b", "bg-amber-500", "text-white"],
									["amber-700", "#b45309", "bg-amber-700", "text-white"],
								].map(([name, hex, swatchClass, textClass]) => (
									<div className="flex items-center gap-3" key={name}>
										<div className={`h-16 w-16 rounded-lg ${swatchClass}`} />
										<div>
											<p className={`font-mono text-sm font-medium ${textClass}`}>{name}</p>
											<p className="text-xs text-slate-600">{hex}</p>
										</div>
									</div>
								))}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Neutral - Text & Backgrounds</CardTitle>
								<CardDescription>Base colors for content and UI</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{[
									["slate-50", "#f8fafc", "bg-slate-50 border border-slate-200", ""],
									["slate-200", "#e2e8f0", "bg-slate-200", ""],
									["slate-600", "#475569", "bg-slate-600", "text-white"],
									["slate-900", "#0f172a", "bg-slate-900", "text-white"],
								].map(([name, hex, swatchClass, textClass]) => (
									<div className="flex items-center gap-3" key={name}>
										<div className={`h-16 w-16 rounded-lg ${swatchClass}`} />
										<div>
											<p className={`font-mono text-sm font-medium ${textClass}`}>{name}</p>
											<p className="text-xs text-slate-600">{hex}</p>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					</div>
				</section>

				<section>
					<h2 className="mb-6 text-2xl font-semibold text-slate-900">Buttons</h2>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Primary Actions</CardTitle>
								<CardDescription>Main CTAs and important actions</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<Button>Schedule Appointment</Button>
								<Button>
									<Heart className="h-4 w-4" />
									Save Patient
								</Button>
								<Button size="sm">Confirm</Button>
								<Button size="lg">Book Now</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Secondary Actions</CardTitle>
								<CardDescription>Alternative and supporting actions</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<Button variant="outline">Cancel</Button>
								<Button variant="ghost">View Details</Button>
								<Button className="bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600">
									<Check className="h-4 w-4" />
									Approve
								</Button>
								<Button disabled>Unavailable</Button>
							</CardContent>
						</Card>
					</div>
				</section>

				<section>
					<h2 className="mb-6 text-2xl font-semibold text-slate-900">Form Elements</h2>
					<Card>
						<CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="text-input">Text Input</Label>
								<Input id="text-input" placeholder="Enter patient name..." />
							</div>
							<div className="space-y-2">
								<Label htmlFor="email-input">Email Input</Label>
								<Input id="email-input" type="email" placeholder="patient@example.com" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="date-input">Date Input</Label>
								<Input id="date-input" type="date" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="time-input">Time Input</Label>
								<Input id="time-input" type="time" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="disabled-input">Disabled Input</Label>
								<Input disabled id="disabled-input" placeholder="Not editable" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="search-input">Search Input</Label>
								<Input id="search-input" type="search" placeholder="Search patients..." />
							</div>
						</CardContent>
					</Card>
				</section>

				<section>
					<h2 className="mb-6 text-2xl font-semibold text-slate-900">Status Badges</h2>
					<Card>
						<CardContent className="flex flex-wrap gap-3 p-6">
							<Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Confirmed</Badge>
							<Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Pending</Badge>
							<Badge>Cancelled</Badge>
							<Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Active</Badge>
							<Badge className="bg-red-100 text-red-700 hover:bg-red-200">Urgent</Badge>
						</CardContent>
					</Card>
				</section>

				<section>
					<h2 className="mb-6 text-2xl font-semibold text-slate-900">Alert States</h2>
					<div className="space-y-4">
						{[
							{
								icon: Check,
								title: "Success",
								description: "Appointment has been scheduled successfully",
								container: "border-emerald-200 bg-emerald-50",
								iconClass: "text-emerald-600",
								textClass: "text-emerald-900",
								descriptionClass: "text-emerald-700",
							},
							{
								icon: Info,
								title: "Information",
								description: "Patient records have been updated",
								container: "border-blue-200 bg-blue-50",
								iconClass: "text-blue-600",
								textClass: "text-blue-900",
								descriptionClass: "text-blue-700",
							},
							{
								icon: AlertCircle,
								title: "Warning",
								description: "This appointment conflicts with another booking",
								container: "border-amber-200 bg-amber-50",
								iconClass: "text-amber-600",
								textClass: "text-amber-900",
								descriptionClass: "text-amber-700",
							},
						].map(({ icon: Icon, title, description, container, iconClass, textClass, descriptionClass }) => (
							<div className={`flex items-start gap-3 rounded-lg border p-4 ${container}`} key={title}>
								<Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${iconClass}`} />
								<div>
									<p className={`font-medium ${textClass}`}>{title}</p>
									<p className={`text-sm ${descriptionClass}`}>{description}</p>
								</div>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}