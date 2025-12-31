/**
 * Type-safe error handling utilities for Encore API client
 * This module provides proper type-safe error handling for APIError from the generated client
 */

import { isAPIError } from "@/brand-client"
import type { ErrCode } from "@/brand-client"
import { AUTH_COOKIE_NAMES } from "@/lib/constants"

/**
 * Extract error message from any error type
 * SSOT: This is the ONLY error message utility - use this everywhere
 *
 * @param error - Any error type (APIError, Error, string, unknown)
 * @param defaultMessage - Fallback message if extraction fails
 *
 * @example
 * catch (error) {
 *   toast.error(getErrorMessage(error, "Failed to save"))
 * }
 */
export function getErrorMessage(error: unknown, defaultMessage = "An error occurred"): string {
	if (isAPIError(error)) {
		return error.message || defaultMessage
	}

	if (error instanceof Error) {
		const message = error.message

		// User-friendly messages for common errors
		if (message.includes("unexpected response") || message.includes("Unexpected")) {
			return "Backend server returned an unexpected response."
		}

		if (message.includes("502") || message.includes("503") || message.includes("504")) {
			return "Backend server is not responding."
		}

		if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
			return "Network error. Please check your internet connection."
		}

		return message
	}

	if (typeof error === "string") {
		return error
	}

	return defaultMessage
}

/**
 * Extract error code from APIError
 */
export function extractErrorCode(error: unknown): ErrCode | undefined {
	if (isAPIError(error)) {
		return error.code
	}
	return undefined
}

/**
 * Extract HTTP status from APIError
 */
export function extractErrorStatus(error: unknown): number | undefined {
	if (isAPIError(error)) {
		return error.status
	}
	return undefined
}

/**
 * Check if error is an authentication/authorization error (401 or 403)
 * Works in both client and server contexts
 */
export function isAuthenticationError(error: unknown): boolean {
	if (isAPIError(error)) {
		// 401 Unauthorized - session expired or invalid
		// 403 Forbidden - session revoked or insufficient permissions
		return error.status === 401 || error.status === 403 || error.code === "unauthenticated"
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
 * Check if error is a not found error (404)
 */
export function isNotFoundError(error: unknown): boolean {
	if (isAPIError(error)) {
		return error.status === 404 || error.code === "not_found"
	}
	return false
}

/**
 * Check if error is a validation error (400)
 */
export function isValidationError(error: unknown): boolean {
	if (isAPIError(error)) {
		return error.status === 400 || error.code === "invalid_argument"
	}
	return false
}

/**
 * Get detailed error information for logging
 */
export function getErrorDetails(error: unknown): {
	message: string
	code?: ErrCode
	status?: number
	details?: unknown
	isAPIError: boolean
} {
	if (isAPIError(error)) {
		return {
			message: error.message,
			code: error.code,
			status: error.status,
			details: error.details,
			isAPIError: true,
		}
	}

	return {
		message: getErrorMessage(error),
		isAPIError: false,
	}
}

/**
 * Client-side: Handle authentication errors by redirecting to login
 * Use this in error boundaries and catch blocks on the client
 * SSOT: Uses AUTH_COOKIE_NAMES from @/lib/constants
 */
export function handleAuthError(error: unknown): void {
	if (isAuthenticationError(error)) {
		// Only run on client
		if (typeof window !== "undefined") {
			// SSOT: Clear all auth cookies from centralized list
			for (const cookieName of AUTH_COOKIE_NAMES) {
				document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
			}

			// Redirect to sign-in with return URL
			const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
			window.location.href = `/sign-in?redirect=${returnUrl}`
		}
	}
}






