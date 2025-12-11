'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, patch } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { User, ApiResponse, ApiError } from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'
import { profileKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { profileKeys }

// Retry configuration - don't retry on 4xx errors
const shouldRetry = (failureCount: number, error: AxiosError<ApiError>) => {
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false
  }
  return failureCount < 3
}

// ============================================
// Types
// ============================================

export interface Session {
  id: string
  device: string
  iconType: 'computer' | 'smartphone' | 'mac'
  ip: string
  location: string
  lastActive: string
  signedIn: string
  isCurrent: boolean
}

export interface ProfileData {
  user: User
  sessions: Session[]
}

// ============================================
// Query Hooks
// ============================================

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.user(),
    queryFn: () => get<ApiResponse<User>>('/api/user'),
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

export function useSessions() {
  return useQuery({
    queryKey: profileKeys.sessions(),
    queryFn: () => get<ApiResponse<Session[]>>('/api/user/sessions'),
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
// Mutation Hooks
// ============================================

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name?: string; email?: string; phone?: string }) =>
      patch<ApiResponse<User>>('/api/user', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.user() })
    },
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) =>
      patch<ApiResponse<void>>(`/api/user/sessions/${sessionId}/revoke`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() })
    },
  })
}

// ============================================
// SSR Hydration Hook
// ============================================

/**
 * Fetch profile data for SSR hydration
 * Used by the profile page to hydrate React Query cache
 */
export function useProfileData() {
  return useQuery({
    queryKey: profileKeys.data(),
    queryFn: async () => {
      const response = await get<ApiResponse<ProfileData>>('/api/user/data')
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
    staleTime: STALE_TIMES.STANDARD,
    retry: shouldRetry,
  })
}
