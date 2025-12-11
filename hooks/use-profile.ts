'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { auth } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'
import { profileKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { profileKeys }

// Re-export types from Encore for convenience
export type User = auth.User
export type Session = auth.Session

// ============================================
// Types
// ============================================

export interface ProfileData {
  user: User
  sessions: Session[]
}

// ============================================
// Query Hooks
// ============================================

export function useProfile() {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: profileKeys.user(),
    queryFn: () => client.auth.getMe(),
    staleTime: STALE_TIMES.STANDARD,
  })
}

export function useSessions(token?: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: profileKeys.sessions(),
    queryFn: async () => {
      if (!token) return []
      const result = await client.auth.listSessions({ token })
      return result.sessions
    },
    enabled: !!token,
    staleTime: STALE_TIMES.STANDARD,
  })
}

// ============================================
// Mutation Hooks
// ============================================

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: { name?: string; image?: string }) =>
      client.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.user() })
    },
  })
}

export function useRevokeSession(token?: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (sessionToken: string) => {
      if (!token) throw new Error('Token required')
      return client.auth.revokeSession({ token, sessionToken })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() })
    },
  })
}

export function useRevokeAllSessions(token?: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error('Token required')
      return client.auth.revokeSessions({ token })
    },
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
export function useProfileData(token?: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: profileKeys.data(),
    queryFn: async () => {
      const [user, sessionsData] = await Promise.all([
        client.auth.getMe(),
        token ? client.auth.listSessions({ token }) : Promise.resolve({ sessions: [] }),
      ])
      return {
        user,
        sessions: sessionsData.sessions,
      }
    },
    staleTime: STALE_TIMES.STANDARD,
  })
}
