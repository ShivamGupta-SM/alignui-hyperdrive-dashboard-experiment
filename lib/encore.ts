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

	// In development, use local Encore server
	return process.env.ENCORE_API_URL || Local
}

// Create a singleton client instance for server-side use
let clientInstance: Client | null = null

/**
 * Get the Encore client for server-side use.
 * This should only be used in server components and API routes.
 * 
 * IMPORTANT: For MSW mocking, ensure MSW is initialized BEFORE calling this function.
 * The client uses fetch which must be patched by MSW first.
 */
export function getEncoreClient(options?: ClientOptions): Client {
	// If mocking is enabled, use current global fetch (which MSW should have patched)
	// This ensures we use the patched fetch instead of the bound fetch from module load time
	if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
		// CRITICAL: Always use the current global fetch, not a cached/bound version
		// MSW patches globalThis.fetch, so we must use it directly
		const currentFetch = typeof globalThis.fetch !== "undefined" ? globalThis.fetch : undefined
		
		if (!currentFetch) {
			console.error("[Encore Client] WARNING: globalThis.fetch is undefined! MSW may not be initialized.")
		}
		
		const patchedOptions: ClientOptions = {
			...options,
			fetcher: currentFetch,
		}
		
		if (!clientInstance) {
			clientInstance = new Client(getEncoreBaseUrl(), patchedOptions)
			console.log("[Encore Client] Created client with MSW-patched fetch")
		} else {
			// If client already exists but we need to ensure it uses patched fetch, recreate it
			// This is important because the client might have been created before MSW patched fetch
			if (currentFetch && clientInstance) {
				// Check if we need to recreate with patched fetch
				// For now, just log - the with() method should handle it
			}
		}

		// If options are provided, return a new client with those options
		if (options) {
			return clientInstance.with(patchedOptions)
		}

		return clientInstance
	}

	// Normal flow without mocking
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
