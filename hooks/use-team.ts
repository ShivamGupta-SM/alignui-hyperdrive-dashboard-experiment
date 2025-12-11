'use client'

import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { TeamMember, Invitation, ApiResponse, ApiError } from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'
import { teamKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { teamKeys }

// Retry configuration - don't retry on 4xx errors
const shouldRetry = (failureCount: number, error: AxiosError<ApiError>) => {
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false
  }
  return failureCount < 3
}

// ============================================
// Query Hooks
// ============================================

export function useTeamMembers() {
  return useQuery({
    queryKey: teamKeys.members(),
    queryFn: () => get<ApiResponse<TeamMember[]>>('/api/team'),
    staleTime: STALE_TIMES.STANDARD,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

// ============================================
// SSR Hydration Hook
// ============================================

export interface TeamStats {
  total: number
  admins: number
  viewers: number
}

export interface TeamData {
  members: TeamMember[]
  stats: TeamStats
}

/**
 * Fetch team data for SSR hydration
 * Used by the team page to hydrate React Query cache
 */
export function useTeamData() {
  return useQuery({
    queryKey: teamKeys.data(),
    queryFn: async () => {
      const response = await get<ApiResponse<TeamData>>('/api/team/data')
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
    staleTime: STALE_TIMES.STANDARD,
    retry: shouldRetry,
  })
}

// ============================================
// Invitation Hooks
// ============================================

/**
 * Fetch pending invitations
 */
export function useInvitations() {
  return useQuery({
    queryKey: [...teamKeys.all, 'invitations'] as const,
    queryFn: async () => {
      const response = await get<ApiResponse<Invitation[]>>('/api/team/invitations')
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
    staleTime: STALE_TIMES.STANDARD,
    retry: shouldRetry,
  })
}
