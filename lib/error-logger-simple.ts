/**
 * Simple Error Logger - No Dependencies
 * 
 * Enhances console.error with context for debugging.
 * Works with Next.js built-in error handlers.
 */

export interface ErrorContext {
	source?: string
	data?: Record<string, unknown>
}

interface APIError extends Error {
	code?: string
	status?: number
	details?: unknown
}

interface ErrorObject {
	message?: string
	error?: string | Error
	code?: string
	status?: number
	details?: unknown
	[key: string]: unknown
}

function isAPIError(error: unknown): error is APIError {
	return (
		error instanceof Error &&
		typeof error === "object" &&
		error !== null &&
		("code" in error || "status" in error)
	)
}

function isErrorObject(error: unknown): error is ErrorObject {
	return typeof error === "object" && error !== null
}

/**
 * Enhanced console.error with context
 * 
 * Usage:
 *   logError(error, { source: "getDashboardData", data: { orgId } })
 */
export function logError(error: unknown, context?: ErrorContext): void {
	const source = context?.source || "Unknown"
	const data = context?.data || {}
	
	// Extract error message
	let message = "An unexpected error occurred"
	if (error instanceof Error) {
		message = error.message || error.name || message
	} else if (typeof error === "string") {
		message = error
	} else if (isErrorObject(error)) {
		// Try to extract message from error object
		if (typeof error.message === "string") {
			message = error.message
		} else if (typeof error.error === "string") {
			message = error.error
		} else {
			message = JSON.stringify(error)
		}
	}
	
	// Enhanced error serialization for better debugging
	let serializedError: Record<string, unknown>
	if (error instanceof Error) {
		serializedError = {
			name: error.name,
			message: error.message,
			stack: error.stack,
		}
		
		// Try to extract additional properties if it's an API error
		if (isAPIError(error)) {
			if (error.code) serializedError.code = error.code
			if (error.status) serializedError.status = error.status
			if (error.details) serializedError.details = error.details
		}
	} else if (isErrorObject(error)) {
		// Try to serialize object error
		try {
			serializedError = {
				...error,
			}
			// Try to extract nested error
			if (error.error) {
				serializedError.nestedError = error.error
			}
		} catch {
			serializedError = { error: String(error) }
		}
	} else {
		serializedError = { error: String(error) }
	}

	// Log with context
	console.error(
		`\n🚨 [${source}] ${message}\n`,
		{
			error: serializedError,
			context: data,
			timestamp: new Date().toISOString(),
		},
		"\n"
	)
}

/**
 * Log SSR data fetching error
 */
export function logSSRError(
	error: unknown,
	functionName: string,
	dataType: string,
	additionalContext?: ErrorContext
): void {
	logError(error, {
		source: `[SSR] ${functionName}`,
		data: {
			dataType,
			fallbackUsed: true,
			...additionalContext?.data,
		},
	})
}

/**
 * Log API call error
 */
export function logAPIError(
	error: unknown,
	source: string,
	endpoint: string,
	params?: unknown
): void {
	logError(error, {
		source: `[API] ${source}`,
		data: {
			endpoint,
			params,
		},
	})
}

/**
 * Log info message (for development only)
 * In production, these should be sent to logging service
 */
export function logInfo(message: string, context?: ErrorContext): void {
	if (process.env.NODE_ENV === "development") {
		const source = context?.source || "Unknown"
		const data = context?.data || {}
		console.log(`ℹ️ [${source}] ${message}`, data)
	}
	// In production, send to logging service (Sentry, LogRocket, etc.)
}

/**
 * Log warning message
 */
export function logWarn(message: string, context?: ErrorContext): void {
	const source = context?.source || "Unknown"
	const data = context?.data || {}
	console.warn(`⚠️ [${source}] ${message}`, data)
	// In production, send to logging service
}


