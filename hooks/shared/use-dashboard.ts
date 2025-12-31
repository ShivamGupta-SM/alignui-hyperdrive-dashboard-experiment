/**
 * Dashboard React Query Hook
 *
 * Clean pattern: Direct client usage
 */

"use client"

import { useQuery } from "@tanstack/react-query"
import { client } from "@/lib/api/client"
import type { organizations } from "@/brand-client"
import { logWarn, logError } from "@/lib/logging/error-logger-simple"
import { STALE_TIME } from "@/lib/utils/query-config"

// ============================================
// Query Keys
// ============================================
export const dashboardKeys = {
	all: (orgId: string) => ["dashboard", orgId] as const,
	stats: (orgId: string, days: number) => [...dashboardKeys.all(orgId), "stats", days] as const,
}

// ============================================
// Types
// ============================================
export type DashboardData = organizations.DashboardOverviewResponse

// ============================================
// Hook
// ============================================

/**
 * Fetch dashboard overview data
 */
export function useDashboard(options: { organizationId: string; days?: number; enabled?: boolean }) {
	const { organizationId, days = 7, enabled = true } = options

	return useQuery<DashboardData | null>({
		queryKey: dashboardKeys.stats(organizationId, days),
		queryFn: async () => {
			try {
				if (!organizationId) {
					logWarn("No organization ID provided for dashboard", { source: "useDashboard" })
					return null
				}

				return await client.organizations.getDashboardOverview(organizationId, { days })
			} catch (error: unknown) {
				logError(error, {
					source: "useDashboard",
					data: { organizationId, days, action: "getDashboardOverview" },
				})
				return null
			}
		},
		enabled: enabled && !!organizationId,
		staleTime: STALE_TIME.SHORT,
		gcTime: STALE_TIME.MEDIUM,
		retry: 2, // Allow retries for transient network errors
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
		refetchOnWindowFocus: true, // Refresh when user returns to tab
	})
}
