'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, patch } from '@/lib/axios'
import { useRouter } from 'next/navigation'
import type { AxiosError } from 'axios'
import type { ApiResponse, ApiError, Organization } from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'

// Retry configuration - don't retry on 4xx errors
const shouldRetry = (failureCount: number, error: AxiosError<ApiError>) => {
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false
  }
  return failureCount < 3
}

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
  campaignStats: (id: string) => [...organizationKeys.detail(id), 'campaignStats'] as const,
}

// ============================================
// Types
// ============================================

export interface MyOrganization {
  id: string
  name: string
  slug: string
  logo: string | null
  role: 'owner' | 'admin' | 'member'
  status: Organization['status']
  verificationStatus: 'pending' | 'verified' | 'rejected'
}

export interface OrganizationCampaignStats {
  totalCampaigns: number
  activeCampaigns: number
  completedCampaigns: number
  draftCampaigns: number
  totalBudget: number
  spentBudget: number
  remainingBudget: number
  totalEnrollments: number
  approvedEnrollments: number
  pendingEnrollments: number
}

export interface SwitchOrganizationResponse {
  message: string
  organization: {
    id: string
    name: string
    slug: string
  }
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch user's organizations (client-side)
 * Use this when you need to refresh the org list dynamically
 */
export function useMyOrganizations() {
  return useQuery({
    queryKey: organizationKeys.my(),
    queryFn: () => get<ApiResponse<MyOrganization[]>>('/api/organizations/my'),
    staleTime: STALE_TIMES.STATIC,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

/**
 * Fetch current organization details (client-side)
 */
export function useCurrentOrganization() {
  return useQuery({
    queryKey: organizationKeys.current(),
    queryFn: () => get<ApiResponse<Organization>>('/api/organizations/current'),
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

/**
 * Fetch organization by ID
 */
export function useOrganization(id: string) {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => get<ApiResponse<Organization>>(`/api/organizations/${id}`),
    enabled: !!id,
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

/**
 * Fetch organization campaign statistics
 */
export function useOrganizationCampaignStats(organizationId: string) {
  return useQuery({
    queryKey: organizationKeys.campaignStats(organizationId),
    queryFn: () => get<ApiResponse<OrganizationCampaignStats>>(`/api/organizations/${organizationId}/campaign-stats`),
    enabled: !!organizationId,
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

/**
 * Switch active organization
 * This sets a cookie and invalidates all caches
 */
export function useSwitchOrganization() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (organizationId: string) =>
      post<ApiResponse<SwitchOrganizationResponse>>('/api/organizations/switch', { organizationId }),
    onSuccess: (response) => {
      if (response.success) {
        // Also update localStorage for client-side persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('active-organization-id', JSON.stringify(response.data.organization.id))
        }
        // Invalidate all queries to refetch with new org context
        queryClient.invalidateQueries()
        // Refresh to update server components
        router.refresh()
      }
    },
  })
}

/**
 * Update organization logo
 */
export function useUpdateOrganizationLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ organizationId, file }: { organizationId: string; file: File }) => {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch(`/api/organizations/${organizationId}/logo`, {
        method: 'PATCH',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload logo')
      }

      return response.json() as Promise<ApiResponse<{ id: string; logo: string }>>
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.organizationId) })
      queryClient.invalidateQueries({ queryKey: organizationKeys.my() })
      queryClient.invalidateQueries({ queryKey: organizationKeys.current() })
    },
  })
}

/**
 * Update organization logo by URL
 */
export function useUpdateOrganizationLogoUrl() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organizationId, logoUrl }: { organizationId: string; logoUrl: string }) =>
      patch<ApiResponse<{ id: string; logo: string }>>(`/api/organizations/${organizationId}/logo`, { logoUrl }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.organizationId) })
      queryClient.invalidateQueries({ queryKey: organizationKeys.my() })
      queryClient.invalidateQueries({ queryKey: organizationKeys.current() })
    },
  })
}

/**
 * Request credit limit increase
 */
export function useRequestCreditIncrease() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organizationId, requestedAmount, reason }: {
      organizationId: string
      requestedAmount: number
      reason: string
    }) =>
      post<ApiResponse<{ message: string; requestId: string }>>(`/api/organizations/${organizationId}/credit-increase`, {
        requestedAmount,
        reason,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.organizationId) })
    },
  })
}
