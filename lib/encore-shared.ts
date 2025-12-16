/**
 * Shared utilities for Encore client setup
 * Used by both browser and server client wrappers
 */

import { Local, Environment } from "./encore-client"

/**
 * Get base URL for Encore client based on environment
 * Works for both client and server contexts
 */
export function getEncoreBaseUrl(): string {
	// Server-side rendering
	if (typeof window === "undefined") {
		// In production, use the environment-specific URL
		if (process.env.NODE_ENV === "production") {
			const envName = process.env.ENCORE_ENVIRONMENT || "production"
			return Environment(envName)
		}
		// In development, use env variable or local
		return process.env.NEXT_PUBLIC_ENCORE_URL || process.env.ENCORE_API_URL || Local
	}

	// Client-side - use public env variable or local
	return process.env.NEXT_PUBLIC_ENCORE_URL || Local
}

// Re-export for convenience
export { Local, Environment }



