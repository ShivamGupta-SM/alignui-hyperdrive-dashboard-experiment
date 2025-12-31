/**
 * Browser-Side Encore Client
 *
 * SSOT for all client-side API calls (React Query, mutations, etc.)
 *
 * Key features:
 * - Singleton pattern for browser (reuse connection)
 * - Automatic cookie-based auth (credentials: include)
 * - CORS-ready configuration
 *
 * Import this in 'use client' components only.
 */

"use client"

import Client from "@/brand-client"
import type { ClientOptions } from "@/brand-client"
import { getEncoreBaseUrl } from "./encore-shared"

// Singleton client instance for browser
let clientInstance: Client | null = null

/**
 * Get the Encore client for browser/client-side use
 * Uses singleton pattern - same instance across all components
 */
export function getEncoreBrowserClient(options?: ClientOptions): Client {
	const baseUrl = getEncoreBaseUrl()

	if (!clientInstance) {
		clientInstance = new Client(baseUrl, {
			requestInit: {
				credentials: "include", // Send cookies with requests
				mode: "cors",
			},
		})
	}

	// If additional options provided, create derived client
	if (options) {
		return clientInstance.with(options)
	}

	return clientInstance
}

/**
 * Get authenticated browser client with explicit bearer token
 * Use when you have a token (e.g., from localStorage)
 *
 * Note: Most cases should use getEncoreBrowserClient() which
 * automatically sends cookies via credentials: include
 */
export function getAuthenticatedBrowserClient(token: string): Client {
	return getEncoreBrowserClient({
		requestInit: {
			credentials: "include",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	})
}

/**
 * Reset the client singleton
 * Call on sign-out to clear any cached state
 */
export function resetEncoreBrowserClient(): void {
	clientInstance = null
}

// Re-export types and namespaces from brand-client
export type { ClientOptions } from "@/brand-client"
export {
	admin,
	auth,
	campaigns,
	coupons,
	enrollments,
	integrations,
	notifications,
	organizations,
	platforms,
	products,
	shared,
	shoppers,
	storage,
	wallets,
	webhooks,
} from "@/brand-client"

// Re-export Client class for type usage
export default Client
