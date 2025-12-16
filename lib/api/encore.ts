// Server-only Encore client wrapper
// This file can only be imported on the server-side
import "server-only"

import Client from "./encore-client"
import type { ClientOptions } from "./encore-client"
import { getEncoreBaseUrl } from "./encore-shared"

// Create a singleton client instance for server-side use
let clientInstance: Client | null = null

/**
 * Get the Encore client for server-side use.
 * This should only be used in server components and API routes.
 */
export function getEncoreClient(options?: ClientOptions): Client {
	// Use singleton pattern
	const baseUrl = getEncoreBaseUrl()
	if (!clientInstance) {
		clientInstance = new Client(baseUrl, options)
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
} from "../errors/encore-error-handler"

// Note: For logging utilities, use direct import:
// import { logError } from "@/lib/logging/error-logger-simple"

// Note: For type namespaces, use direct import:
// import type { campaigns } from "@/lib/api/encore-client"
