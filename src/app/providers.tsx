"use client";

import { SessionProvider } from "next-auth/react";

type ProvidersProps = {
	children: React.ReactNode;
	authBasePath: string;
};

export function Providers({ children, authBasePath }: ProvidersProps) {
	return <SessionProvider basePath={authBasePath}>{children}</SessionProvider>;
}