/**
 * API Clients - Public API
 *
 * SSOT for all API client imports
 *
 * @example
 * // Browser (client components)
 * import { client } from "@/lib/api"
 *
 * // Server (actions, SSR)
 * import { getAuthenticatedEncoreClient, ssrFetch } from "@/lib/api"
 */

// Browser client (singleton) - use in client components
export { client, resetClient, getEncoreBrowserClient, getAuthenticatedBrowserClient } from "./client"

// Server client (per-request) - use in server actions and SSR
export {
	getEncoreClient,
	getAuthenticatedEncoreClient,
	ssrFetch,
	ssrFetchParallel,
	emptyPaginatedResponse,
	getErrorDetails,
} from "./server"

export type {
	PaginatedResponse,
	SSRFetchOptions,
	ClientOptions,
} from "./server"

// Shared utilities
export { getEncoreBaseUrl } from "./encore-shared"
