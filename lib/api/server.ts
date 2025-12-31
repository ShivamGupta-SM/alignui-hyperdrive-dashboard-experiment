/**
 * Server-Side Encore Client
 *
 * SSOT for all server-side API calls (Server Actions, SSR, API routes)
 *
 * Key differences from browser client:
 * - NO singleton pattern (each request gets fresh client)
 * - Supports both cookie-based and token-based auth
 * - Uses server-only environment variables
 */

import "server-only"
import Client from "@/brand-client"
import type { ClientOptions } from "@/brand-client"
import { getEncoreBaseUrl } from "./encore-shared"

/**
 * Get unauthenticated Encore client for server-side use
 * Creates a new instance per request (no singleton)
 */
export function getEncoreClient(options?: ClientOptions): Client {
	const baseUrl = getEncoreBaseUrl()
	return new Client(baseUrl, options)
}

/**
 * Get authenticated Encore client with bearer token
 * Use this when you have an explicit auth token
 *
 * @param token - JWT/Bearer token for authentication
 */
export function getAuthenticatedEncoreClient(token: string, options?: ClientOptions): Client {
	const baseUrl = getEncoreBaseUrl()
	return new Client(baseUrl, {
		...options,
		requestInit: {
			...options?.requestInit,
			headers: {
				...options?.requestInit?.headers,
				Authorization: `Bearer ${token}`,
			},
		},
	})
}

// Re-export getErrorDetails from encore-error-handler (SSOT)
// Note: This function is the canonical source for error details extraction
export { getErrorDetails } from "@/lib/errors/encore-error-handler"

// Re-export types from brand-client for convenience
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

// ============================================
// Generic SSR Fetcher Utilities
// SSOT: Reduces ~800 lines of duplicate SSR fetching patterns
// ============================================

import { getAuthClient } from "@/lib/auth/server"
import { isAuthenticationError, getErrorMessage } from "@/lib/errors/encore-error-handler"
import { logSSRError, logWarn } from "@/lib/logging/error-logger-simple"
import { SSR_PAGE_SIZE } from "@/lib/utils/query-config"

/**
 * Standard paginated response shape
 */
export interface PaginatedResponse<T> {
	data: T[]
	total: number
	skip: number
	take: number
	hasMore: boolean
}

/**
 * Empty paginated response for error cases
 */
export function emptyPaginatedResponse<T>(take = SSR_PAGE_SIZE.DEFAULT): PaginatedResponse<T> {
	return {
		data: [],
		total: 0,
		skip: 0,
		take,
		hasMore: false,
	}
}

/**
 * SSR fetch options
 */
export interface SSRFetchOptions {
	/** Source identifier for logging */
	source: string
	/** Feature name for logging */
	feature: string
	/** Additional context data for logging */
	context?: Record<string, unknown>
	/** Whether to require authentication (default: true) */
	requireAuth?: boolean
}

/**
 * Wrapper for SSR data fetching with standardized error handling
 *
 * @example
 * // In features/campaigns/ssr.ts
 * export async function getCampaignsData(organizationId: string) {
 *   return ssrFetch({
 *     source: "getCampaignsData",
 *     feature: "campaigns",
 *     context: { organizationId },
 *   }, async (client) => {
 *     const response = await client.organizations.listCampaigns(organizationId, {
 *       skip: 0,
 *       take: SSR_PAGE_SIZE.DEFAULT,
 *     })
 *     return { campaigns: response.data, ...response }
 *   }, {
 *     campaigns: [],
 *     data: [],
 *     total: 0,
 *     skip: 0,
 *     take: SSR_PAGE_SIZE.DEFAULT,
 *     hasMore: false,
 *   })
 * }
 */
export async function ssrFetch<T>(
	options: SSRFetchOptions,
	fetcher: (client: Awaited<ReturnType<typeof getAuthClient>>) => Promise<T>,
	fallback: T
): Promise<T> {
	const { source, feature, context, requireAuth = true } = options

	try {
		const client = await getAuthClient()

		if (requireAuth) {
			const session = await client.auth.getSession()
			if (!session?.user) {
				logWarn(`User not authenticated, returning empty ${feature} data`, { source })
				return fallback
			}
		}

		return await fetcher(client)
	} catch (error) {
		// Handle authentication errors gracefully
		if (isAuthenticationError(error)) {
			logWarn(`Authentication error in ${source}, returning empty data`, {
				source,
				data: { errorMessage: getErrorMessage(error), ...context },
			})
			return fallback
		}

		logSSRError(error, source, feature, { data: context })
		return fallback
	}
}

/**
 * Wrapper for parallel SSR data fetching with Promise.allSettled
 *
 * @example
 * // In features/campaigns/ssr.ts
 * export async function getCampaignDetailData(orgId: string, campaignId: string) {
 *   return ssrFetchParallel({
 *     source: "getCampaignDetailData",
 *     feature: "campaign-detail",
 *     context: { orgId, campaignId },
 *   }, async (client) => ({
 *     campaign: client.organizations.getCampaign(orgId, campaignId),
 *     stats: client.organizations.getCampaignStats(orgId, campaignId),
 *     deliverables: client.organizations.listCampaignDeliverables(orgId, campaignId),
 *   }))
 * }
 */
export async function ssrFetchParallel<T extends Record<string, Promise<unknown>>>(
	options: SSRFetchOptions,
	fetcher: (client: Awaited<ReturnType<typeof getAuthClient>>) => T
): Promise<{ [K in keyof T]: Awaited<T[K]> | null }> {
	const { source, feature, context } = options

	try {
		const client = await getAuthClient()
		const promises = fetcher(client)
		const keys = Object.keys(promises) as (keyof T)[]

		const results = await Promise.allSettled(Object.values(promises))

		const output = {} as { [K in keyof T]: Awaited<T[K]> | null }

		results.forEach((result, index) => {
			const key = keys[index]
			if (result.status === "fulfilled") {
				output[key] = result.value as Awaited<T[typeof key]>
			} else {
				output[key] = null
				logSSRError(result.reason, source, `${feature}-${String(key)}`, { data: context })
			}
		})

		return output
	} catch (error) {
		logSSRError(error, source, feature, { data: context })

		// Return all nulls on complete failure
		const client = await getAuthClient()
		const keys = Object.keys(fetcher(client)) as (keyof T)[]
		const output = {} as { [K in keyof T]: Awaited<T[K]> | null }
		for (const key of keys) {
			output[key] = null
		}
		return output
	}
}
