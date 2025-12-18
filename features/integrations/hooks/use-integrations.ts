/**
 * Integrations React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 */

"use client"

import { useQuery } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import { STALE_TIME } from "@/lib/utils/query-config"

// ============================================
// Client Instance
// ============================================
const client = getEncoreBrowserClient()

// ============================================
// Query Keys
// ============================================
export const integrationKeys = {
	all: ["integrations"] as const,
	platforms: () => [...integrationKeys.all, "platforms"] as const,
	platformsList: () => [...integrationKeys.platforms(), "list"] as const,
	platformsActive: () => [...integrationKeys.platforms(), "active"] as const,
	platform: (id: string) => [...integrationKeys.platforms(), "detail", id] as const,
	platformByName: (name: string) => [...integrationKeys.platforms(), "name", name] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * Get all platforms
 */
export function usePlatforms(page = 1, limit = 50) {
	return useQuery({
		queryKey: integrationKeys.platformsList(),
		queryFn: () =>
			client.integrations.listPlatforms({
				skip: (page - 1) * limit,
				take: limit,
			}),
		staleTime: STALE_TIME.LONG,
	})
}

/**
 * Get active platforms only
 */
export function useActivePlatforms() {
	return useQuery({
		queryKey: integrationKeys.platformsActive(),
		queryFn: async () => {
			const result = await client.integrations.listActivePlatforms()
			return result.platforms
		},
		staleTime: STALE_TIME.LONG,
	})
}

/**
 * Get platform by ID
 */
export function usePlatform(id: string) {
	return useQuery({
		queryKey: integrationKeys.platform(id),
		queryFn: () => client.integrations.getPlatform(id),
		enabled: !!id,
		staleTime: STALE_TIME.LONG,
	})
}

/**
 * Get platform by name/slug
 */
export function usePlatformByName(name: string) {
	return useQuery({
		queryKey: integrationKeys.platformByName(name),
		queryFn: () => client.integrations.getPlatformByName(name),
		enabled: !!name,
		staleTime: STALE_TIME.LONG,
	})
}
