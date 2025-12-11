'use client'

import { useQuery } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { organizations } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'
import { dashboardKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { dashboardKeys }

// ============================================
// Types - Re-export from Encore client for convenience
// ============================================

export type DashboardData = organizations.DashboardOverviewResponse
export type DashboardStats = organizations.DashboardStats
export type EnrollmentChartDataPoint = organizations.EnrollmentChartDataPoint
export type TopCampaign = organizations.TopCampaign
export type EnrollmentDistribution = organizations.EnrollmentDistribution

// ============================================
// Query Options (shared between client and server)
// ============================================

export const dashboardQueryOptions = (organizationId?: string) => ({
  queryKey: dashboardKeys.stats(),
  queryFn: async () => {
    const client = getEncoreBrowserClient()
    // Use the provided organizationId or fall back to a default
    const orgId = organizationId || 'default'
    return client.organizations.getDashboardOverview(orgId, { days: 30 })
  },
  staleTime: STALE_TIMES.STANDARD, // 1 minute
}) as const

// ============================================
// Query Hooks
// ============================================

export function useDashboard(organizationId?: string) {
  return useQuery({
    ...dashboardQueryOptions(organizationId),
  })
}

export function useDashboardStats(organizationId?: string) {
  const { data, ...rest } = useDashboard(organizationId)
  return {
    data: data?.stats,
    ...rest,
  }
}

export function useEnrollmentChart(organizationId?: string) {
  const { data, ...rest } = useDashboard(organizationId)
  return {
    data: data?.enrollmentChart,
    ...rest,
  }
}

export function useTopCampaigns(organizationId?: string) {
  const { data, ...rest } = useDashboard(organizationId)
  return {
    data: data?.topCampaigns,
    ...rest,
  }
}
