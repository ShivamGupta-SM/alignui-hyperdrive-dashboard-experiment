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

/**
 * Log debug message (development only)
 *
 * @param message - Debug message
 * @param context - Optional context data
 */
export function logDebug(message: string, context?: ErrorContext): void {
	if (process.env.NODE_ENV === "development") {
		const source = context?.source || "Unknown"
		const data = context?.data || {}
		console.log(`🐛 [${source}] ${message}`, data)
	}
}

/**
 * Create a standardized mutation error handler
 * Use this for React Query mutation onError callbacks
 *
 * SSOT: Single pattern for all mutation error handling
 *
 * @param actionName - Human-readable name of the action (e.g., "create campaign")
 * @param options - Additional options for error handling
 *
 * @example
 * const mutation = useMutation({
 *   mutationFn: createCampaign,
 *   onError: createMutationErrorHandler("create campaign"),
 * })
 *
 * @example
 * // With custom toast
 * const mutation = useMutation({
 *   mutationFn: deleteProduct,
 *   onError: createMutationErrorHandler("delete product", {
 *     showToast: true,
 *     toastTitle: "Delete Failed"
 *   }),
 * })
 */
export function createMutationErrorHandler(
	actionName: string,
	options?: {
		showToast?: boolean
		toastTitle?: string
		additionalContext?: Record<string, unknown>
	}
): (error: unknown) => void {
	const { showToast = true, toastTitle, additionalContext } = options || {}

	return (error: unknown) => {
		// Log the error with context
		logError(error, {
			source: `Mutation: ${actionName}`,
			data: {
				action: actionName,
				...additionalContext,
			},
		})

		// Show toast if enabled (lazy import to avoid circular deps)
		if (showToast) {
			// Dynamic import to avoid bundling sonner in server code
			import("sonner").then(({ toast }) => {
				const message = error instanceof Error
					? error.message
					: `Failed to ${actionName}`
				toast.error(toastTitle || "Action Failed", {
					description: message,
				})
			}).catch(() => {
				// Silently fail if sonner not available
			})
		}
	}
}

/**
 * Create a standardized query error handler
 * Use this for React Query query onError callbacks
 *
 * @param queryName - Human-readable name of the query (e.g., "fetch campaigns")
 *
 * @example
 * const query = useQuery({
 *   queryKey: ["campaigns"],
 *   queryFn: fetchCampaigns,
 *   onError: createQueryErrorHandler("fetch campaigns"),
 * })
 */
export function createQueryErrorHandler(
	queryName: string,
	options?: {
		additionalContext?: Record<string, unknown>
	}
): (error: unknown) => void {
	const { additionalContext } = options || {}

	return (error: unknown) => {
		logError(error, {
			source: `Query: ${queryName}`,
			data: {
				query: queryName,
				...additionalContext,
			},
		})
	}
}


