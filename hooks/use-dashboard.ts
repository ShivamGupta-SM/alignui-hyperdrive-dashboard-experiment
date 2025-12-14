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

	return useQuery<DashboardData | null>({
		queryKey: dashboardKeys.stats(),
		queryFn: async () => {
			try {
      const client = getEncoreBrowserClient()

			// If organizationId is provided, use it; otherwise get from active org
			if (!organizationId) {
				// Get active organization from session
				const sessionResponse = await client.auth.getSession()
				const activeOrgId = sessionResponse?.user?.activeOrganizationId

				if (!activeOrgId) {
						// Return null instead of throwing to prevent hook order issues
						console.warn("No active organization found for dashboard")
						return null
				}

				const response = await client.organizations.getDashboardOverview(activeOrgId, { days })
				return response
			}

			const response = await client.organizations.getDashboardOverview(organizationId, { days })
			return response
			} catch (error) {
				// Log error but return null instead of throwing to prevent hook order issues
				console.error("Failed to fetch dashboard data:", error)
				return null
			}
		},
		enabled,
		staleTime: 30 * 1000, // 30 seconds
		gcTime: 5 * 60 * 1000, // 5 minutes
		retry: false, // Don't retry to prevent hook order issues
	})
}
