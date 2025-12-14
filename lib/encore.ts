// Server-only Encore client wrapper
// This file can only be imported on the server-side
import "server-only"

import Client, { Local, Environment } from "./encore-client"
import type { ClientOptions } from "./encore-client"

// Determine the base URL based on environment
function getEncoreBaseUrl() {
	// In production, use the environment-specific URL
	if (process.env.NODE_ENV === "production") {
		const envName = process.env.ENCORE_ENVIRONMENT || "production"
		return Environment(envName)
	}

	// In development, use NEXT_PUBLIC_ENCORE_URL or ENCORE_API_URL or Local
	const baseUrl = process.env.NEXT_PUBLIC_ENCORE_URL || process.env.ENCORE_API_URL || Local
	return baseUrl
}

// Create a singleton client instance for server-side use
let clientInstance: Client | null = null

/**
 * Get the Encore client for server-side use.
 * This should only be used in server components and API routes.
 */
export function getEncoreClient(options?: ClientOptions): Client {
	// Use singleton pattern
	if (!clientInstance) {
		clientInstance = new Client(getEncoreBaseUrl(), options)
	}

	// If options are provided, return a new client with those options
	if (options) {
		return clientInstance.with(options)
	}

	return clientInstance
}

/**
 * Get an authenticated Encore client.
 * Pass the auth token from the request context.
 */
export function getAuthenticatedEncoreClient(authToken: string): Client {
	return getEncoreClient({
		requestInit: {
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		},
	})
}

// Re-export types from the generated client for convenience
export type { ClientOptions } from "./encore-client"

// Re-export error types and utilities
// Note: APIError (class) and ErrCode (enum) export both value and type automatically
export { APIError, isAPIError, ErrCode } from "./encore-client"

// Re-export error handler utilities
export {
	extractErrorMessage,
	extractErrorCode,
	extractErrorStatus,
	isAuthenticationError,
	isNotFoundError,
	isValidationError,
	getErrorDetails,
	handleAPIError,
} from "./encore-error-handler"

// Re-export simple error logging utilities (no dependencies)
export {
	logError,
	logAPIError,
	logSSRError,
} from "./error-logger-simple"
export type { ErrorContext } from "./error-logger-simple"

// Re-export namespaces for type access
export {
	campaigns,
	enrollments,
	wallets,
	organizations,
	products,
	invoices,
	notifications,
	shared,
	admin,
	auth,
	shoppers,
} from "./encore-client"
