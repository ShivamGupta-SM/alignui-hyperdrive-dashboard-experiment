'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { campaigns, shared } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'
import { campaignKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { campaignKeys }

// ============================================
// Types - Re-export from Encore client for convenience
// ============================================

export type Campaign = campaigns.Campaign
export type CampaignWithStats = campaigns.CampaignWithStats
export type CampaignStats = campaigns.CampaignStats
export type CampaignPricing = campaigns.CampaignPricing
export type CampaignPerformance = campaigns.CampaignPerformance
export type CampaignStatus = shared.CampaignStatus
export type CampaignType = shared.CampaignType

// Filter types
export interface CampaignFilters {
  status?: CampaignStatus
  search?: string
  page?: number
  limit?: number
  organizationId?: string
  productId?: string
  platformId?: string
  categoryId?: string
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch paginated list of campaigns with stats
 * Returns Encore's paginated response directly
 */
export function useCampaigns(filters: CampaignFilters = {}) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: campaignKeys.list(filters),
    queryFn: () => client.campaigns.listCampaigns({
      status: filters.status,
      organizationId: filters.organizationId,
      productId: filters.productId,
      platformId: filters.platformId,
      categoryId: filters.categoryId,
      skip: filters.page ? (filters.page - 1) * (filters.limit || 20) : 0,
      take: filters.limit || 20,
    }),
    staleTime: STALE_TIMES.STANDARD,
  })
}

/**
 * Fetch single campaign by ID with stats
 */
export function useCampaign(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => client.campaigns.getCampaign(id),
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
  })
}

/**
 * Fetch campaigns data for SSR hydration
 */
export function useCampaignsData(status?: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: campaignKeys.data(status),
    queryFn: async () => {
      const response = await client.campaigns.listCampaigns({
        status: status && status !== 'all' ? status as CampaignStatus : undefined,
        take: 50,
      })
      return {
        campaigns: response.data,
        allCampaigns: response.data,
        stats: {
          total: response.total,
          active: response.data.filter(c => c.status === 'active').length,
          endingSoon: response.data.filter(c => {
            const endDate = new Date(c.endDate)
            const now = new Date()
            const daysUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            return c.status === 'active' && daysUntilEnd <= 7 && daysUntilEnd > 0
          }).length,
          draft: response.data.filter(c => c.status === 'draft').length,
          pending: response.data.filter(c => c.status === 'pending_approval').length,
          completed: response.data.filter(c => c.status === 'completed').length,
          totalEnrollments: response.data.reduce((sum, c) => sum + c.currentEnrollments, 0),
          totalPayout: response.data.reduce((sum, c) => sum + c.totalPayout, 0),
        },
      }
    },
    staleTime: STALE_TIMES.STANDARD,
  })
}

/**
 * Fetch campaign detail data for SSR hydration
 */
export function useCampaignDetailData(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...campaignKeys.detail(id), 'ssr'] as const,
    queryFn: async () => {
      const campaign = await client.campaigns.getCampaign(id)
      return { campaign, enrollments: [] }
    },
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
  })
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Create a new campaign
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: campaigns.CreateCampaignRequest) =>
      client.campaigns.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
    },
  })
}

/**
 * Update an existing campaign
 */
export function useUpdateCampaign(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: campaigns.UpdateCampaignRequest) =>
      client.campaigns.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

/**
 * Delete a campaign
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (id: string) => client.campaigns.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
    },
  })
}

/**
 * Update campaign status with optimistic updates
 */
export function useUpdateCampaignStatus(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: async (status: CampaignStatus) => {
      // Map status to the appropriate action
      switch (status) {
        case 'active':
          return client.campaigns.activateCampaign(id)
        case 'paused':
          return client.campaigns.pauseCampaign(id, { reason: 'User requested pause' })
        case 'ended':
          return client.campaigns.endCampaign(id)
        case 'cancelled':
          return client.campaigns.cancelCampaign(id)
        case 'completed':
          return client.campaigns.completeCampaign(id)
        case 'archived':
          return client.campaigns.archiveCampaign(id)
        default:
          throw new Error(`Cannot directly set status to ${status}`)
      }
    },
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: campaignKeys.detail(id) })
      const previousCampaign = queryClient.getQueryData<CampaignWithStats>(campaignKeys.detail(id))

      queryClient.setQueryData<CampaignWithStats>(campaignKeys.detail(id), (old) => {
        if (!old) return old
        return { ...old, status: newStatus }
      })

      return { previousCampaign }
    },
    onError: (_err, _newStatus, context) => {
      if (context?.previousCampaign) {
        queryClient.setQueryData(campaignKeys.detail(id), context.previousCampaign)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

// ============================================
// Campaign Action Hooks
// ============================================

/**
 * Submit campaign for approval
 */
export function useSubmitCampaign(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: () => client.campaigns.submitForApproval(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

/**
 * Activate an approved campaign
 */
export function useActivateCampaign(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: () => client.campaigns.activateCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

/**
 * Pause an active campaign
 */
export function usePauseCampaign(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (reason?: string) =>
      client.campaigns.pauseCampaign(id, { reason: reason || 'Paused by user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

/**
 * Resume a paused campaign
 */
export function useResumeCampaign(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: () => client.campaigns.resumeCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

/**
 * End an active or paused campaign
 */
export function useEndCampaign(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: () => client.campaigns.endCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

/**
 * Complete an ended campaign
 */
export function useCompleteCampaign(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: () => client.campaigns.completeCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

/**
 * Archive a campaign
 */
export function useArchiveCampaign(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: () => client.campaigns.archiveCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

/**
 * Cancel a campaign
 */
export function useCancelCampaign(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: () => client.campaigns.cancelCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

/**
 * Duplicate a campaign
 */
export function useDuplicateCampaign(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (newTitle?: string) =>
      client.campaigns.duplicateCampaign(id, { newTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
    },
  })
}

/**
 * Validate a campaign
 */
export function useCampaignValidation(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...campaignKeys.detail(id), 'validation'] as const,
    queryFn: () => client.campaigns.validateCampaign(id),
    enabled: !!id,
    staleTime: 0, // Always fresh
  })
}

/**
 * Fetch campaign statistics
 */
export function useCampaignStats(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...campaignKeys.detail(id), 'stats'] as const,
    queryFn: () => client.campaigns.getCampaignStats(id),
    enabled: !!id,
    staleTime: STALE_TIMES.REALTIME,
  })
}

// ============================================
// Campaign Deliverables Hooks
// ============================================

// Note: useCampaignDeliverables is exported from use-deliverables.ts

/**
 * Update campaign deliverables (batch)
 */
export function useUpdateCampaignDeliverables(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: {
      deliverables: Array<{
        deliverableId: string
        quantity?: number
        isRequired?: boolean
        instructions?: string
      }>
    }) => client.campaigns.addCampaignDeliverablesBatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

// ============================================
// Campaign Performance & Pricing Hooks
// ============================================

/**
 * Fetch campaign performance data for charts
 */
export function useCampaignPerformance(id: string, days = 30) {
  const client = getEncoreBrowserClient()

  // Calculate date range
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return useQuery({
    queryKey: [...campaignKeys.detail(id), 'performance', days] as const,
    queryFn: () => client.campaigns.getCampaignPerformance(id, { startDate, endDate }),
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
    select: (response) => response.data,
  })
}

/**
 * Fetch campaign pricing details
 */
export function useCampaignPricing(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...campaignKeys.detail(id), 'pricing'] as const,
    queryFn: () => client.campaigns.getCampaignPricing(id),
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
  })
}

/**
 * Payout estimate response type
 */
export interface PayoutEstimate {
  orderValue: number
  shopperPayout: number
  brandCost: number
  gstAmount: number
  platformFee: number
}

/**
 * Calculate estimated payout for an order value
 */
export function useCalculatePayoutEstimate(id: string) {
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: async (orderValue: number): Promise<PayoutEstimate> => {
      const result = await client.campaigns.calculatePayoutEstimate(id, { orderValue })
      return {
        orderValue,
        shopperPayout: result.shopperPayout,
        brandCost: result.brandCost,
        gstAmount: result.gstAmount,
        platformFee: result.platformFee,
      }
    },
  })
}

// ============================================
// Campaign Search Hooks
// ============================================

export interface CampaignSearchParams {
  q: string
  skip?: number
  take?: number
  status?: CampaignStatus
}

/**
 * Search campaigns by title/description
 */
export function useSearchCampaigns(params: CampaignSearchParams) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...campaignKeys.all, 'search', params] as const,
    queryFn: () => client.campaigns.searchCampaigns(params),
    enabled: !!params.q && params.q.length >= 2,
    staleTime: STALE_TIMES.STANDARD,
  })
}

/**
 * Debounced search hook for real-time search input
 */
export function useDebouncedCampaignSearch(query: string, delay = 300) {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, delay)

    return () => clearTimeout(timer)
  }, [query, delay])

  return useSearchCampaigns({ q: debouncedQuery })
}
