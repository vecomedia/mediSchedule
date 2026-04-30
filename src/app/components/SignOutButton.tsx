"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/app/components/ui/button";

export default function SignOutButton() {
	return (
		<Button
			variant="outline"
			size="sm"
			className="w-full"
			onClick={() => signOut({ callbackUrl: "/login" })}
		>
			<LogOut className="h-4 w-4 mr-2" />
			Logout
		</Button>
	);
}
