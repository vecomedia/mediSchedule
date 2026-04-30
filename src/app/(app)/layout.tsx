import { redirect } from "next/navigation";

import { auth } from "@/auth";
import SidebarNav from "@/app/components/NavItem";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const user = session.user;
	const initials = user.name?.split(" ").map((n) => n[0]).join("") ?? "U";

	const isPatient = user.role === "patient";

	return (
		<div className="flex h-screen bg-slate-50">
			{!isPatient && <SidebarNav role={user.role ?? "staff"} name={user.name ?? ""} initials={initials} />}
			<main className="flex-1 overflow-auto">
				{children}
			</main>
		</div>
	);
}