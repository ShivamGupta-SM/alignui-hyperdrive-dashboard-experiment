"use client"

import { useQuery } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/encore-browser"
import { dashboardKeys } from "@/lib/query-keys"
import type { organizations, auth } from "@/lib/encore-browser"
import { useSession } from "./use-session"

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

	return useQuery<DashboardData | null>({
		queryKey: dashboardKeys.stats(),
		queryFn: async () => {
			try {
				const client = getEncoreBrowserClient()

				// If organizationId is provided, use it; otherwise get from active org
				let activeOrgId = organizationId
				
				if (!activeOrgId) {
					// Get active organization from session hook (already fetched)
					// sessionData.user is MeResponse which has activeOrganizationId
					const meUser = sessionData?.user as auth.MeResponse | undefined
					activeOrgId = meUser?.activeOrganizationId || undefined

					if (!activeOrgId) {
						// Return null instead of throwing to prevent hook order issues
						console.warn("No active organization found for dashboard")
						return null
					}
				}

				const response = await client.organizations.getDashboardOverview(activeOrgId, { days })
				return response
			} catch (error: unknown) {
				// Log error with more details
				const errorMessage = error instanceof Error ? error.message : "Unknown error"
				const errorCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : "UNKNOWN"
				console.error("Failed to fetch dashboard data:", {
					message: errorMessage,
					code: errorCode,
					error: error
				})
				return null
			}
		},
		enabled: enabled && !!sessionData, // Only fetch when session is loaded
		staleTime: 60 * 1000, // 1 minute (increased from 30s for better performance)
		gcTime: 5 * 60 * 1000, // 5 minutes
		retry: false, // Don't retry to prevent hook order issues
		refetchOnWindowFocus: false, // Disable auto-refetch on focus for dashboard (data updates infrequently)
	})
}
