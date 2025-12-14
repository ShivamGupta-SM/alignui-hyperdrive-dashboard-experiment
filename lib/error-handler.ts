"use client"

import { redirect } from "next/navigation"
import { APIError } from "./encore-client"

/**
 * Check if error is an authentication/authorization error
 * Returns true if user should be redirected to login
 */
export function isAuthError(error: unknown): boolean {
	if (error instanceof APIError) {
		// 401 Unauthorized - session expired or invalid
		// 403 Forbidden - session revoked or insufficient permissions
		return error.status === 401 || error.status === 403
	}

	// Check error message for common auth error patterns
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
 * Handle authentication errors by redirecting to login
 * Use this in error boundaries and catch blocks
 */
export function handleAuthError(error: unknown): void {
	if (isAuthError(error)) {
		// Clear any auth tokens/cookies
		if (typeof window !== "undefined") {
			// Clear auth token cookie
			document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
			document.cookie = "better-auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

			// Redirect to login with return URL
			const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
			window.location.href = `/sign-in?redirect=${returnUrl}`
		}
	}
}

/**
 * Server-side auth error handler
 * Use in Server Components and Server Actions
 */
export function handleServerAuthError(error: unknown): never {
	if (isAuthError(error)) {
		redirect("/sign-in")
	}
	throw error
}
