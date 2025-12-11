'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { organizations, shared } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'
import { useRouter } from 'next/navigation'

// Re-export types from Encore for convenience
export type Organization = organizations.Organization
export type OrganizationCampaignStats = organizations.OrganizationCampaignStats
export type OrganizationStats = organizations.OrganizationStats
export type ApprovalStatus = shared.ApprovalStatus
export type AccountTier = shared.AccountTier

// ============================================
// Query Keys
// ============================================

export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...organizationKeys.lists(), filters] as const,
  my: () => [...organizationKeys.all, 'my'] as const,
  current: () => [...organizationKeys.all, 'current'] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  stats: (id: string) => [...organizationKeys.detail(id), 'stats'] as const,
  campaignStats: (id: string) => [...organizationKeys.detail(id), 'campaignStats'] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch user's organizations (client-side)
 * Use this when you need to refresh the org list dynamically
 */
export function useMyOrganizations() {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: organizationKeys.my(),
    queryFn: async () => {
      const result = await client.organizations.getMyOrganizations()
      return result.data
    },
    staleTime: STALE_TIMES.STATIC,
  })
}

/**
 * Fetch organization by ID
 */
export function useOrganization(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => client.organizations.getOrganization(id),
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
  })
}

/**
 * Fetch current organization (reads from localStorage)
 * Returns the first organization if no current org is set
 */
export function useCurrentOrganization() {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: organizationKeys.current(),
    queryFn: async () => {
      // First try to get the organization ID from localStorage
      let currentOrgId: string | null = null
      if (typeof window !== 'undefined') {
        currentOrgId = localStorage.getItem('currentOrganizationId')
      }

      // If we have a stored org ID, fetch that org
      if (currentOrgId) {
        try {
          return await client.organizations.getOrganization(currentOrgId)
        } catch {
          // If the stored org doesn't exist, fall through to get user's orgs
        }
      }

      // Otherwise, get user's organizations and return the first one
      const result = await client.organizations.getMyOrganizations()
      if (result.data.length > 0) {
        // Store the first org as current
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentOrganizationId', result.data[0].id)
        }
        return result.data[0]
      }

      return null
    },
    staleTime: STALE_TIMES.STANDARD,
  })
}

/**
 * Fetch organization statistics
 */
export function useOrganizationStats(organizationId: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: organizationKeys.stats(organizationId),
    queryFn: () => client.organizations.getOrganizationStats(organizationId),
    enabled: !!organizationId,
    staleTime: STALE_TIMES.STANDARD,
  })
}

/**
 * Fetch organization campaign statistics
 */
export function useOrganizationCampaignStats(organizationId: string, skip = 0, take = 20) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...organizationKeys.campaignStats(organizationId), { skip, take }] as const,
    queryFn: () => client.organizations.getOrganizationCampaignStats(organizationId, { skip, take }),
    enabled: !!organizationId,
    staleTime: STALE_TIMES.STANDARD,
  })
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Create a new organization
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: organizations.CreateOrganizationRequest) =>
      client.organizations.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.my() })
    },
  })
}

/**
 * Update organization
 */
export function useUpdateOrganization(organizationId: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: organizations.UpdateOrganizationRequest) =>
      client.organizations.updateOrganization(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(organizationId) })
      queryClient.invalidateQueries({ queryKey: organizationKeys.my() })
    },
  })
}

/**
 * Update organization logo by URL
 */
export function useUpdateOrganizationLogo(organizationId: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (logoUrl: string) =>
      client.organizations.updateOrganizationLogo(organizationId, { logoUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(organizationId) })
      queryClient.invalidateQueries({ queryKey: organizationKeys.my() })
    },
  })
}

/**
 * Switch active organization
 * This invalidates all caches and refreshes the router
 *
 * Note: localStorage is managed by the calling component via useLocalStorage hook.
 * This hook only handles the query invalidation and router refresh.
 * The cookie is synced from localStorage via useEffect in dashboard-shell.
 */
export function useSwitchOrganization() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (organizationId: string) => {
      // Organization switching is handled client-side via localStorage
      // The server reads the organization from the x-organization-id header
      // which is set by the axios interceptor reading from localStorage
      return { success: true, organizationId }
    },
    onSuccess: () => {
      // Invalidate all queries to refetch with new org context
      queryClient.invalidateQueries()
      // Refresh to update server components
      router.refresh()
    },
  })
}

/**
 * Request credit limit increase
 * Can be called with or without organizationId pre-bound
 */
export function useRequestCreditIncrease(presetOrgId?: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: { organizationId?: string; requestedAmount: number; reason?: string }) => {
      const orgId = data.organizationId || presetOrgId
      if (!orgId) throw new Error('Organization ID is required')
      return client.organizations.requestCreditIncrease(orgId, {
        requestedAmount: data.requestedAmount,
        reason: data.reason,
      })
    },
    onSuccess: (_, variables) => {
      const orgId = variables.organizationId || presetOrgId
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: organizationKeys.detail(orgId) })
      }
    },
  })
}

/**
 * Submit organization for approval
 */
export function useSubmitForApproval(organizationId: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: () => client.organizations.submitOrganizationForApproval(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(organizationId) })
      queryClient.invalidateQueries({ queryKey: organizationKeys.my() })
    },
  })
}
