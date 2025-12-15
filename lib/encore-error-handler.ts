/**
 * Type-safe error handling utilities for Encore API client
 * This module provides proper type-safe error handling for APIError from the generated client
 */

import { APIError, isAPIError } from "./encore-client"
import type { ErrCode } from "./encore-client"

/**
 * Extract error message from any error, with proper type handling
 */
export function extractErrorMessage(error: unknown): string {
	if (isAPIError(error)) {
		// This is a proper APIError from Encore backend
		return error.message || "An error occurred"
	}

	if (error instanceof Error) {
		return error.message
	}

	if (typeof error === "string") {
		return error
	}

	return "An unexpected error occurred"
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
 * Check if error is an authentication error (401)
 */
export function isAuthenticationError(error: unknown): boolean {
	if (isAPIError(error)) {
		return error.status === 401 || error.code === "unauthenticated"
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
	details?: any
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
		message: extractErrorMessage(error),
		isAPIError: false,
	}
}

/**
 * Type-safe error handler for server actions
 * Returns a consistent error format for frontend consumption
 */
export function handleAPIError(error: unknown): {
	success: false
	error: string
	code?: ErrCode
	status?: number
} {
	const details = getErrorDetails(error)

	return {
		success: false,
		error: details.message,
		code: details.code,
		status: details.status,
	}
}




