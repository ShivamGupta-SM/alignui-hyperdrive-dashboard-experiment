"use client"

import { useQuery } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/encore-browser"
import { dashboardKeys } from "@/lib/query-keys"
import type { organizations } from "@/lib/encore-browser"

// ============================================
// Types
// ============================================

export type DashboardData = organizations.DashboardOverviewResponse

// ============================================
// React Query Hook
// ============================================

/**
 * Hook to fetch dashboard overview data
 * Uses React Query for caching and automatic refetching
 */
export function useDashboard(options?: {
	organizationId?: string
	days?: number
	enabled?: boolean
}) {
	const { organizationId, days = 7, enabled = true } = options ?? {}

	return useQuery({
		queryKey: dashboardKeys.stats(),
		queryFn: async () => {
      const client = getEncoreBrowserClient()

			// If organizationId is provided, use it; otherwise get from active org
			if (!organizationId) {
				// Get active organization from session
				const sessionResponse = await client.auth.getSession()
				const activeOrgId = sessionResponse?.user?.activeOrganizationId

				if (!activeOrgId) {
					throw new Error("No active organization found")
				}

				const response = await client.organizations.getDashboardOverview(activeOrgId, { days })
				return response
			}

			const response = await client.organizations.getDashboardOverview(organizationId, { days })
			return response
		},
		enabled,
		staleTime: 30 * 1000, // 30 seconds
		gcTime: 5 * 60 * 1000, // 5 minutes
	})
}
