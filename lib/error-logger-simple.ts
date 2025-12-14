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
	const message = error instanceof Error 
		? error.message 
		: String(error)
	
	// Log with context
	console.error(
		`\n🚨 [${source}] ${message}\n`,
		{
			error: error instanceof Error ? {
				name: error.name,
				message: error.message,
				stack: error.stack,
			} : error,
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

