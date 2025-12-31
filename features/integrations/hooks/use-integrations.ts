/**
 * Integrations React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 * Platform endpoints are in the 'platforms' namespace
 */

"use client"

import { useQuery } from "@tanstack/react-query"
import { client } from "@/lib/api/client"
import { STALE_TIME, PAGE_SIZE, DEFAULT_RETRY_CONFIG } from "@/lib/utils/query-config"

// ============================================
// Query Keys
// ============================================
export const integrationKeys = {
	all: ["integrations"] as const,
	platforms: () => [...integrationKeys.all, "platforms"] as const,
	platformsList: () => [...integrationKeys.platforms(), "list"] as const,
	platformsActive: () => [...integrationKeys.platforms(), "active"] as const,
	platform: (id: string) => [...integrationKeys.platforms(), "detail", id] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// Platform endpoints are in client.platforms namespace
// ============================================

/**
 * Get all platforms
 * SSOT: Uses PAGE_SIZE.MEDIUM for consistent pagination
 */
export function usePlatforms(page = 1, limit = PAGE_SIZE.MEDIUM) {
	return useQuery({
		queryKey: integrationKeys.platformsList(),
		queryFn: () =>
			client.platforms.listPlatforms({
				skip: (page - 1) * limit,
				take: limit,
			}),
		staleTime: STALE_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get active platforms only
 */
export function useActivePlatforms() {
	return useQuery({
		queryKey: integrationKeys.platformsActive(),
		queryFn: async () => {
			const result = await client.platforms.listActivePlatforms()
			return result.platforms
		},
		staleTime: STALE_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get platform by ID
 */
export function usePlatform(id: string) {
	return useQuery({
		queryKey: integrationKeys.platform(id),
		queryFn: () => client.platforms.getPlatform(id),
		enabled: !!id,
		staleTime: STALE_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

