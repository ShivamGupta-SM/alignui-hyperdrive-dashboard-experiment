'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, patch, del } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type {
  Campaign,
  CampaignStatus,
  ApiResponse,
  PaginatedResponse,
  ApiError,
} from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'
import { campaignKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { campaignKeys }

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

export interface CampaignFilters {
  status?: string
  search?: string
  page?: number
  limit?: number
  [key: string]: string | number | undefined
}

interface CreateCampaignData {
  title: string
  description?: string
  productId: string
  type: 'cashback' | 'barter' | 'hybrid'
  isPublic: boolean
  maxEnrollments: number
  submissionDeadlineDays: number
  startDate: string
  endDate: string
}

interface UpdateCampaignData extends Partial<CreateCampaignData> {
  status?: CampaignStatus
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch paginated list of campaigns
 * Returns full PaginatedResponse with data and meta
 */
export function useCampaigns(filters: CampaignFilters = {}) {
  return useQuery({
    queryKey: campaignKeys.list(filters),
    queryFn: () => get<PaginatedResponse<Campaign>>('/api/campaigns', { params: filters }),
    staleTime: STALE_TIMES.STANDARD,
    retry: shouldRetry,
  })
}

/**
 * Fetch single campaign by ID
 * Returns unwrapped Campaign data directly via select
 */
export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => get<ApiResponse<Campaign>>(`/api/campaigns/${id}`),
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

// ============================================
// Mutation Hooks
// ============================================

/**
 * Create a new campaign
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCampaignData) =>
      post<ApiResponse<Campaign>>('/api/campaigns', data),
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

  return useMutation({
    mutationFn: (data: UpdateCampaignData) =>
      patch<ApiResponse<Campaign>>(`/api/campaigns/${id}`, data),
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

  return useMutation({
    mutationFn: (id: string) =>
      del<ApiResponse<void>>(`/api/campaigns/${id}`),
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

  return useMutation({
    mutationFn: (status: CampaignStatus) =>
      patch<ApiResponse<Campaign>>(`/api/campaigns/${id}`, { status }),
    // Optimistic update
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: campaignKeys.detail(id) })

      const previousCampaign = queryClient.getQueryData<Campaign>(campaignKeys.detail(id))

      queryClient.setQueryData<Campaign>(campaignKeys.detail(id), (old) => {
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
// SSR Hydration Hooks
// ============================================

/**
 * Fetch campaigns data for SSR hydration
 * Used by the campaigns page to hydrate React Query cache
 */
export function useCampaignsData(status?: string) {
  return useQuery({
    queryKey: campaignKeys.data(status),
    queryFn: async () => {
      const response = await get<ApiResponse<{
        campaigns: Campaign[]
        allCampaigns: Campaign[]
        stats: {
          total: number
          active: number
          endingSoon: number
          draft: number
          pending: number
          completed: number
          totalEnrollments: number
          totalPayout: number
        }
      }>>('/api/campaigns/data', { params: { status } })
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
    staleTime: STALE_TIMES.STANDARD,
    retry: shouldRetry,
  })
}

/**
 * Fetch campaign detail data for SSR hydration
 * Used by the campaign detail page to hydrate React Query cache
 */
export function useCampaignDetailData(id: string) {
  return useQuery({
    queryKey: [...campaignKeys.detail(id), 'ssr'] as const,
    queryFn: async () => {
      const response = await get<ApiResponse<{
        campaign: Campaign
        enrollments: { id: string; status: string }[]
      }>>(`/api/campaigns/${id}/data`)
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
    retry: shouldRetry,
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

  return useMutation({
    mutationFn: () =>
      post<ApiResponse<{ id: string; status: string; message: string }>>(`/api/campaigns/${id}/submit`, {}),
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

  return useMutation({
    mutationFn: () =>
      post<ApiResponse<{ id: string; status: string; message: string }>>(`/api/campaigns/${id}/activate`, {}),
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

  return useMutation({
    mutationFn: () =>
      post<ApiResponse<{ id: string; status: string; message: string }>>(`/api/campaigns/${id}/pause`, {}),
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

  return useMutation({
    mutationFn: () =>
      post<ApiResponse<{ id: string; status: string; message: string }>>(`/api/campaigns/${id}/resume`, {}),
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

  return useMutation({
    mutationFn: () =>
      post<ApiResponse<{ id: string; status: string; message: string }>>(`/api/campaigns/${id}/end`, {}),
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

  return useMutation({
    mutationFn: () =>
      post<ApiResponse<{ id: string; status: string; message: string }>>(`/api/campaigns/${id}/complete`, {}),
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

  return useMutation({
    mutationFn: () =>
      post<ApiResponse<{ id: string; status: string; message: string }>>(`/api/campaigns/${id}/archive`, {}),
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

  return useMutation({
    mutationFn: () =>
      post<ApiResponse<{ id: string; status: string; message: string }>>(`/api/campaigns/${id}/cancel`, {}),
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

  return useMutation({
    mutationFn: () =>
      post<ApiResponse<Campaign>>(`/api/campaigns/${id}/duplicate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
    },
  })
}

/**
 * Validate a campaign
 */
export function useCampaignValidation(id: string) {
  return useQuery({
    queryKey: [...campaignKeys.detail(id), 'validation'] as const,
    queryFn: () => get<ApiResponse<{
      isValid: boolean
      errors: { field: string; message: string }[]
      warnings: { field: string; message: string }[]
      canSubmit: boolean
    }>>(`/api/campaigns/${id}/validate`),
    enabled: !!id,
    staleTime: 0, // Always fresh
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
 * Campaign stats response type
 */
export interface CampaignStats {
  totalEnrollments: number
  pendingEnrollments: number
  approvedEnrollments: number
  rejectedEnrollments: number
  changesRequested: number
  awaitingSubmission: number
  approvalRate: number
  totalOrderValue: number
  totalBillAmount: number
  totalPayout: number
  utilizationRate: number
  daysRemaining: number
  averageOrderValue: number
  // Performance metrics
  avgReviewTimeHours: number
  rejectionRate: number
  withdrawalRate: number
  // Product info
  productName: string
  productImage: string | null
  // Trend data for chart
  enrollmentTrend: { name: string; enrollments: number; approved: number }[]
}

/**
 * Fetch campaign statistics
 */
export function useCampaignStats(id: string) {
  return useQuery({
    queryKey: [...campaignKeys.detail(id), 'stats'] as const,
    queryFn: () => get<ApiResponse<CampaignStats>>(`/api/campaigns/${id}/stats`),
    enabled: !!id,
    staleTime: STALE_TIMES.REALTIME,
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
// Campaign Deliverables Hooks
// ============================================

/**
 * Fetch campaign deliverables
 */
export function useCampaignDeliverables(id: string) {
  return useQuery({
    queryKey: [...campaignKeys.detail(id), 'deliverables'] as const,
    queryFn: () => get<ApiResponse<{
      id: string
      name: string
      slug: string
      description: string
      requiresProof: boolean
    }[]>>(`/api/campaigns/${id}/deliverables`),
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
 * Update campaign deliverables (batch)
 */
export function useUpdateCampaignDeliverables(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { deliverables: string[]; action?: 'replace' | 'add' | 'remove' }) =>
      post<ApiResponse<{ id: string; deliverables: string[]; message: string }>>(`/api/campaigns/${id}/deliverables/batch`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

// ============================================
// Campaign Performance & Pricing Hooks
// ============================================

/**
 * Campaign performance data for charts
 */
export interface CampaignPerformance {
  date: string
  enrollments: number
  approvals: number
  rejections: number
  orderValue: number
  payouts: number
}

/**
 * Fetch campaign performance data for charts
 */
export function useCampaignPerformance(id: string, days = 30) {
  return useQuery({
    queryKey: [...campaignKeys.detail(id), 'performance', days] as const,
    queryFn: () => get<ApiResponse<CampaignPerformance[]>>(`/api/campaigns/${id}/performance`, { params: { days } }),
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
 * Campaign pricing breakdown
 */
export interface CampaignPricing {
  campaignId: string
  rebatePercentage: number
  billRate: number
  platformFee: number
  bonusAmount: number
  tdsRate: number
  gstRate: number
  estimatedCostPerEnrollment: number
}

/**
 * Fetch campaign pricing details
 */
export function useCampaignPricing(id: string) {
  return useQuery({
    queryKey: [...campaignKeys.detail(id), 'pricing'] as const,
    queryFn: () => get<ApiResponse<CampaignPricing>>(`/api/campaigns/${id}/pricing`),
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
 * Payout estimate response
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
  return useMutation({
    mutationFn: (orderValue: number) =>
      post<ApiResponse<PayoutEstimate>>(`/api/campaigns/${id}/calculate-payout`, { orderValue }),
  })
}

// ============================================
// Campaign Search Hook
// ============================================

export interface CampaignSearchParams {
  q: string
  skip?: number
  take?: number
  status?: CampaignStatus
}

export interface CampaignSearchResult {
  data: Campaign[]
  total: number
  skip: number
  take: number
  hasMore: boolean
}

/**
 * Search campaigns by title/description
 * Uses full-text search on the backend
 */
export function useSearchCampaigns(params: CampaignSearchParams) {
  return useQuery({
    queryKey: [...campaignKeys.all, 'search', params] as const,
    queryFn: () => get<ApiResponse<CampaignSearchResult>>('/api/campaigns/search', { params }),
    enabled: !!params.q && params.q.length >= 2,
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
