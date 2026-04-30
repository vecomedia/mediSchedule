"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Activity, Calendar, ClipboardList, LayoutDashboard, LogOut, Users } from "lucide-react";

const staffNavItems = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
	{ href: "/calendar", label: "Calendar", icon: Calendar },
	{ href: "/patients", label: "Patients", icon: Users },
	{ href: "/appointments", label: "Appointments", icon: ClipboardList },
];

const patientNavItems = [
	{ href: "/patient-dashboard", label: "My Dashboard", icon: LayoutDashboard, exact: true },
];

type SidebarNavProps = {
	role: string;
	name: string;
	initials: string;
};

export default function SidebarNav({ role, name, initials }: SidebarNavProps) {
	const pathname = usePathname();
	const isPatient = role === "patient";
	const navItems = isPatient ? patientNavItems : staffNavItems;

	return (
		<aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
			{/* Logo / Header */}
			<div className="p-6 border-b border-slate-200">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
						<Activity className="w-6 h-6 text-white" />
					</div>
					<div>
						<h1 className="font-semibold text-slate-900">MediSchedule</h1>
						<p className="text-xs text-slate-500">Healthcare Portal</p>
					</div>
				</div>
			</div>

			{/* User Profile — top for staff */}
			{!isPatient && (
				<div className="p-4 border-b border-slate-200">
					<div className="flex items-center gap-3 px-2 py-1">
						<div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
							<span className="text-sm font-medium text-slate-700">{initials}</span>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-slate-900 truncate">{name}</p>
							<p className="text-xs text-slate-500 truncate capitalize">{role}</p>
						</div>
						<button
							onClick={() => signOut({ callbackUrl: "/login" })}
							className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
							title="Logout"
						>
							<LogOut className="w-4 h-4" />
						</button>
					</div>
				</div>
			)}

			{/* Navigation */}
			<nav className="flex-1 p-4">
				<ul className="space-y-1">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
										isActive
											? "bg-blue-50 text-blue-700"
											: "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
									}`}
								>
									<Icon className="w-5 h-5" />
									<span className="font-medium">{item.label}</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

		</aside>
	);
}
