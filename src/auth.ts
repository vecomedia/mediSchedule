import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";

import NextAuth from "next-auth";

import Credentials from "next-auth/providers/credentials";

import { loginSchema } from "@/lib/validations/auth";
import type { AuthUser, UserRole } from "@/lib/types";

const testUsers: Array<AuthUser & { password: string }> = [
	{
		id: "user-admin",
		email: "admin@medi.dev",
		name: "Alex Mercer",
		role: "admin",
		password: "password123",
	},
	{
		id: "user-staff",
		email: "staff@medi.dev",
		name: "Sam Rivera",
		role: "staff",
		password: "password123",
	},
	{
		id: "user-doctor",
		email: "doctor@medi.dev",
		name: "Dr. Jordan Lee",
		role: "doctor",
		password: "password123",
	},
	{
		id: "user-patient",
		email: "patient@medi.dev",
		name: "Taylor Morgan",
		role: "patient",
		password: "password123",
	},
];

function getUserRole(role: unknown): UserRole {
	if (
		role === "admin" ||
		role === "staff" ||
		role === "doctor" ||
		role === "patient" ||
		role === "receptionist"
	) {
		return role;
	}

	return "staff";
}

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
	throw new Error("AUTH_SECRET environment variable is required in production.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	secret: process.env.AUTH_SECRET ?? "medi-schedule-dev-secret",
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
	},
	providers: [
		Credentials({
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			authorize(credentials) {
				const parsed = loginSchema.safeParse(credentials);

				if (!parsed.success) {
					return null;
				}

				const user = testUsers.find(
					(entry) =>
						entry.email.toLowerCase() === parsed.data.email.toLowerCase() &&
						entry.password === parsed.data.password,
				);

				if (!user) {
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
				};
			},
		}),
	],
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.role = getUserRole(user.role);
			}

			return token;
		},
		session({ session, token }) {
			if (session.user) {
				session.user.id = token.sub ?? session.user.email ?? "";
				session.user.role = getUserRole(token.role);
			}

			return session;
		},
	},
});