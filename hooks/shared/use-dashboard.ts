/**
 * Dashboard React Query Hook
 *
 * Clean pattern: Direct client usage
 */

"use client"

import { useQuery } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import type { organizations } from "@/lib/api/encore-browser"
import { logWarn, logError } from "@/lib/logging/error-logger-simple"

// ============================================
// Client Instance
// ============================================
const client = getEncoreBrowserClient()

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

				return await client.organizations.getDashboardOverview({ organizationId, days })
			} catch (error: unknown) {
				logError(error, {
					source: "useDashboard",
					data: { organizationId, days, action: "getDashboardOverview" },
				})
				return null
			}
		},
		enabled: enabled && !!organizationId,
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000,
		retry: false,
		refetchOnWindowFocus: false,
	})
}
