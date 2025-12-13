'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { switchOrganization as switchOrganizationAction } from '@/app/actions/organizations'
import { useSession } from './use-session'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { organizations, shared } from '@/lib/encore-browser'

// Re-export types from Encore for convenience
export type Organization = organizations.Organization
export type OrganizationCampaignStats = organizations.OrganizationCampaignStats
export type OrganizationStats = organizations.OrganizationStats
export type ApprovalStatus = shared.ApprovalStatus
export type AccountTier = shared.AccountTier

/**
 * Hook to fetch user's organizations
 * Uses React Query for caching and automatic refetching
 * 
 * @returns Organizations list with loading/error states
 * 
 * @example
 * const { data: organizations, isLoading } = useOrganizations()
 */
export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const client = getEncoreBrowserClient()
      const result = await client.auth.listOrganizations()
      return result.organizations || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnWindowFocus: true,
  })
}

/**
 * Modern hook to switch active organization
 * Uses React Query optimistic updates for instant UI feedback
 * 
 * Features:
 * - Optimistic updates (instant UI)
 * - Automatic rollback on error
 * - Session refetch on success
 * - All queries invalidated
 * 
 * @example
 * const switchOrg = useSwitchOrganization()
 * switchOrg.mutate(orgId)
 */
export function useSwitchOrganization() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: sessionData } = useSession()

  return useMutation({
    mutationFn: async (organizationId: string) => {
      const result = await switchOrganizationAction(organizationId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to switch organization')
      }
      return result
    },
    // Optimistic update - instant UI feedback
    onMutate: async (organizationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['session'] })

      // Snapshot previous value
      const previousSession = queryClient.getQueryData(['session'])

      // Optimistically update session
      type SessionData = { session: { user: { activeOrganizationId?: string } }; user: { activeOrganizationId?: string } } | null
      queryClient.setQueryData<SessionData>(['session'], (old) => {
        if (!old) return old
        return {
          ...old,
          user: {
            ...old.user,
            activeOrganizationId: organizationId,
          },
        }
      })

      return { previousSession }
    },
    // On error, rollback
    onError: (err, organizationId, context) => {
      if (context?.previousSession) {
        queryClient.setQueryData(['session'], context.previousSession)
      }
    },
    // On success, refetch and invalidate
    onSuccess: () => {
      // Invalidate session to refetch with new activeOrganizationId
      queryClient.invalidateQueries({ queryKey: ['session'] })
      
      // Invalidate all other queries to refetch with new organization context
      queryClient.invalidateQueries()
      
      // Refresh router to update server components
      router.refresh()
    },
    // Always refetch on settle
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}
