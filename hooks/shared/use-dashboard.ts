"use client"

import { useQuery } from "@tanstack/react-query"
import { dashboardKeys } from "@/lib/query-keys"
import type { organizations, auth } from "@/lib/api/encore-browser"
import { useSession } from "@/features/auth"
import { logWarn, logError } from "@/lib/logging/error-logger-simple"
import { getDashboardOverview } from "@/features/organizations/lib/api"

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
	const { data: sessionData } = useSession()

	// Get active organization ID for query key and API call
	const meUser = sessionData?.user as auth.MeResponse | undefined
	const activeOrgId = organizationId || meUser?.activeOrganizationId

	return useQuery<DashboardData | null>({
		queryKey: [...dashboardKeys.stats(), activeOrgId || "no-org", days],
		queryFn: async () => {
			try {
				if (!activeOrgId) {
					// Return null instead of throwing to prevent hook order issues
					logWarn("No active organization found for dashboard", { source: "useDashboard" })
					return null
				}

				const response = await getDashboardOverview({ days })
				return response
			} catch (error: unknown) {
				// Log error with proper logging utility
				logError(error, { 
					source: "useDashboard", 
					data: { 
						activeOrgId, 
						days,
						action: "getDashboardOverview"
					} 
				})
				return null
			}
		},
		enabled: enabled && !!sessionData && !!activeOrgId, // Only fetch when session is loaded AND has active org
		staleTime: 60 * 1000, // 1 minute (increased from 30s for better performance)
		gcTime: 5 * 60 * 1000, // 5 minutes
		retry: false, // Don't retry to prevent hook order issues
		refetchOnWindowFocus: false, // Disable auto-refetch on focus for dashboard (data updates infrequently)
	})
}
