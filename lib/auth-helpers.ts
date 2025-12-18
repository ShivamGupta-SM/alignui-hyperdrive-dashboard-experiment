/**
 * Authentication Helpers - Centralized Auth Utilities
 * 
 * Industry Standard: Single source of truth for authentication checks
 * Prevents code duplication and ensures consistency
 */

import { getSession } from "@/features/auth"
import { logWarn } from "@/lib/logging/error-logger-simple"
import { getErrorMessageForLog } from "@/lib/utils/format"

/**
 * Check if user is authenticated
 * 
 * @returns Object with success flag and optional user data
 */
export async function requireAuth(): Promise<{
	success: boolean
	user?: unknown
	error?: string
}> {
	try {
		const sessionResult = await getSession({})

		if (!sessionResult?.data?.session || !sessionResult.data.user) {
			return {
				success: false,
				error: "User not authenticated",
			}
		}

		return {
			success: true,
			user: sessionResult.data.user,
		}
	} catch (error) {
		// Handle authentication errors gracefully
		if (error instanceof Error) {
			const errorMessage = error.message.toLowerCase()
			if (
				errorMessage.includes("unauthenticated") ||
				errorMessage.includes("unauthorized") ||
				errorMessage.includes("authentication") ||
				errorMessage.includes("session expired") ||
				errorMessage.includes("invalid authentication credentials")
			) {
				logWarn("Authentication check failed", {
					source: "requireAuth",
					data: { errorMessage },
				})
				return {
					success: false,
					error: "Authentication failed",
				}
			}
		}

		// For other errors, log and return failure
		logWarn("Error checking authentication", {
			source: "requireAuth",
			data: { error: getErrorMessageForLog(error) },
		})

		return {
			success: false,
			error: "Error checking authentication",
		}
	}
}

/**
 * Check if error is an authentication error
 * 
 * @param error - Error to check
 * @returns True if error is authentication-related
 */
export function isAuthenticationError(error: unknown): boolean {
	if (!(error instanceof Error)) {
		return false
	}

	const errorMessage = error.message.toLowerCase()
	return (
		errorMessage.includes("unauthenticated") ||
		errorMessage.includes("unauthorized") ||
		errorMessage.includes("authentication") ||
		errorMessage.includes("session expired") ||
		errorMessage.includes("invalid authentication credentials")
	)
}
