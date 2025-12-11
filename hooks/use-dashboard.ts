'use client'

import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { DashboardData, ApiResponse, ApiError } from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'
import { dashboardKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { dashboardKeys }

// Retry configuration - don't retry on 4xx errors
const shouldRetry = (failureCount: number, error: AxiosError<ApiError>) => {
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false
  }
  return failureCount < 3
}

// ============================================
// Query Functions (exported for server prefetch)
// ============================================

/**
 * Client-side fetch function using axios
 */
async function fetchDashboardClient(): Promise<DashboardData> {
  const response = await get<ApiResponse<DashboardData>>('/api/dashboard')
  if (response.success) {
    return response.data
  }
  throw new Error(response.error)
}

// ============================================
// Query Options (shared between client and server)
// ============================================

export const dashboardQueryOptions = {
  queryKey: dashboardKeys.stats(),
  queryFn: fetchDashboardClient,
  staleTime: STALE_TIMES.STANDARD, // 1 minute
  retry: shouldRetry,
} as const

// ============================================
// Query Hooks
// ============================================

export function useDashboard() {
  return useQuery({
    ...dashboardQueryOptions,
  })
}

export function useDashboardStats() {
  const { data, ...rest } = useDashboard()
  return {
    data: data?.stats,
    ...rest,
  }
}

export function useEnrollmentChart() {
  const { data, ...rest } = useDashboard()
  return {
    data: data?.enrollmentChart,
    ...rest,
  }
}

export function useTopCampaigns() {
  const { data, ...rest } = useDashboard()
  return {
    data: data?.topCampaigns,
    ...rest,
  }
}
