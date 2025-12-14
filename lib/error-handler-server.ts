"use server"

import { redirect } from "next/navigation"
import { APIError } from "./encore-client"

/**
 * Server-side: Check if error is an authentication/authorization error
 */
export async function isAuthError(error: unknown): Promise<boolean> {
	if (error instanceof APIError) {
		return error.status === 401 || error.status === 403
	}

	if (error instanceof Error) {
		const message = error.message.toLowerCase()
		return (
			message.includes("unauthenticated") ||
			message.includes("unauthorized") ||
			message.includes("session expired") ||
			message.includes("session revoked") ||
			message.includes("invalid session") ||
			message.includes("authentication required")
		)
	}

	return false
}

/**
 * Server-side: Handle authentication errors by redirecting to login
 * Use this in Server Actions - redirects if auth error (never returns), otherwise does nothing
 */
export async function handleServerAuthError(error: unknown): Promise<void> {
	if (isAuthError(error)) {
		redirect("/sign-in")
	}
	// Not an auth error, let caller handle it normally
}
