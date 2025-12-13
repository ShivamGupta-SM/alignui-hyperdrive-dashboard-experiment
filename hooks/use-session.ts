'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser, getSession } from '@/app/actions/auth'
import type { auth } from '@/lib/encore-client'

/**
 * Modern session hook - React Query as single source of truth
 * Matches Better Auth's useSession() API exactly
 * 
 * @returns { data: { session, user } | null, isPending, error, refetch }
 * 
 * Features:
 * - Automatic caching (5 min stale time)
 * - Background refetch on window focus
 * - Request deduplication
 * - Type-safe with Better Auth compatibility
 */
export function useSession() {
  const queryClient = useQueryClient()
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      // Fetch user (me endpoint)
      const userResult = await getCurrentUser()
      if (!userResult.success || !userResult.user) {
        return null
      }
      
      // Fetch session details
      const sessionResult = await getSession()
      
      // Map MeResponse userID to id for Better Auth compatibility
      const userWithId = {
        ...userResult.user,
        id: userResult.user.userID,
      }
      
      // Construct Better Auth compatible structure
      const sessionData = sessionResult.success && sessionResult.session
        ? {
            ...sessionResult.session,
            user: sessionResult.user || userWithId,
          }
        : {
            id: '',
            token: '',
            userId: userResult.user.userID,
            expiresAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ipAddress: null,
            userAgent: null,
            user: userWithId,
          }
      
      return {
        session: sessionData,
        user: sessionResult.user || userWithId,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  return {
    data: data || null,
    isPending: isLoading,
    error,
    refetch: async () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
      return refetch()
    },
  }
}

/**
 * Selector hooks for derived state
 * Use these for better performance (only re-render when specific data changes)
 */

export function useUser() {
  const { data } = useSession()
  return data?.user ?? null
}

export function useSessionData() {
  const { data } = useSession()
  return data?.session ?? null
}

export function useIsAuthenticated() {
  const { data } = useSession()
  return !!data?.user
}
