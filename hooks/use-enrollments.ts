'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, patch, post } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type {
  Enrollment,
  EnrollmentStatus,
  ApiResponse,
  PaginatedResponse,
  ApiError,
} from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'
import { dashboardKeys, enrollmentKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { enrollmentKeys }

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

interface EnrollmentFilters {
  status?: string
  campaignId?: string
  search?: string
  page?: number
  limit?: number
  [key: string]: string | number | undefined
}

interface UpdateEnrollmentStatusData {
  status: EnrollmentStatus
  reason?: string
}

// Hooks
export function useEnrollments(filters: EnrollmentFilters = {}) {
  return useQuery({
    queryKey: enrollmentKeys.list(filters),
    queryFn: () => get<PaginatedResponse<Enrollment>>('/api/enrollments', { params: filters }),
    staleTime: STALE_TIMES.REALTIME, // 30 seconds - enrollments change frequently
    retry: shouldRetry,
  })
}

export function useEnrollment(id: string) {
  return useQuery({
    queryKey: enrollmentKeys.detail(id),
    queryFn: () => get<ApiResponse<Enrollment>>(`/api/enrollments/${id}`),
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

export function usePendingEnrollments() {
  return useQuery({
    queryKey: enrollmentKeys.pending(),
    queryFn: () => get<PaginatedResponse<Enrollment>>('/api/enrollments', {
      params: { status: 'awaiting_review', limit: 10 }
    }),
    staleTime: STALE_TIMES.REALTIME,
    retry: shouldRetry,
  })
}

export function useUpdateEnrollmentStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateEnrollmentStatusData) =>
      patch<ApiResponse<Enrollment>>(`/api/enrollments/${id}`, data),
    onMutate: async ({ status }) => {
      await queryClient.cancelQueries({ queryKey: enrollmentKeys.detail(id) })

      const previousEnrollment = queryClient.getQueryData<Enrollment>(enrollmentKeys.detail(id))

      queryClient.setQueryData(enrollmentKeys.detail(id), (old: Enrollment | undefined) => {
        if (!old) return old
        return { ...old, status }
      })

      return { previousEnrollment }
    },
    onError: (_err, _data, context) => {
      if (context?.previousEnrollment) {
        queryClient.setQueryData(enrollmentKeys.detail(id), context.previousEnrollment)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.pending() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })
}

export function useBulkUpdateEnrollments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { ids: string[]; status: EnrollmentStatus; reason?: string }) =>
      patch<ApiResponse<{ updatedCount: number }>>('/api/enrollments/bulk', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })
}

// ============================================
// SSR Hydration Hooks
// ============================================

/**
 * Fetch enrollments data for SSR hydration
 * Used by the enrollments page to hydrate React Query cache
 */
export function useEnrollmentsData(status?: string) {
  return useQuery({
    queryKey: enrollmentKeys.data(status),
    queryFn: async () => {
      const response = await get<ApiResponse<{
        enrollments: Enrollment[]
        allEnrollments: Enrollment[]
        stats: {
          total: number
          pending: number
          overdue: number
          approved: number
          rejected: number
          totalValue: number
        }
      }>>('/api/enrollments/data', { params: { status } })
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
    staleTime: STALE_TIMES.REALTIME,
    retry: shouldRetry,
  })
}

/**
 * Fetch enrollment detail data for SSR hydration
 * Used by the enrollment detail page to hydrate React Query cache
 */
export function useEnrollmentDetailData(id: string) {
  return useQuery({
    queryKey: [...enrollmentKeys.detail(id), 'ssr'] as const,
    queryFn: async () => {
      const response = await get<ApiResponse<{
        enrollment: Enrollment
      }>>(`/api/enrollments/${id}/data`)
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
    enabled: !!id,
    staleTime: STALE_TIMES.REALTIME,
    retry: shouldRetry,
  })
}

// ============================================
// Enrollment Action Hooks
// ============================================

/**
 * Approve an enrollment
 */
export function useApproveEnrollment(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      post<ApiResponse<{ id: string; status: string; message: string }>>(`/api/enrollments/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.pending() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })
}

/**
 * Reject an enrollment
 */
export function useRejectEnrollment(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { reasons: string[]; notes?: string }) =>
      post<ApiResponse<{ id: string; status: string; message: string }>>(`/api/enrollments/${id}/reject`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.pending() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })
}

/**
 * Request changes on an enrollment
 */
export function useRequestEnrollmentChanges(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { requestedChanges: string[]; deadline?: string; notes?: string }) =>
      post<ApiResponse<{ id: string; status: string; message: string }>>(`/api/enrollments/${id}/request-changes`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.pending() })
    },
  })
}

/**
 * Extend enrollment deadline
 */
export function useExtendEnrollmentDeadline(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { newDeadline: string; reason?: string }) =>
      post<ApiResponse<{ id: string; submissionDeadline: string; message: string }>>(`/api/enrollments/${id}/extend-deadline`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(id) })
    },
  })
}

// ============================================
// Enrollment Export & Pricing Hooks
// ============================================

/**
 * Enrollment export row for CSV/Excel
 */
export interface EnrollmentExportRow {
  enrollmentId: string
  orderId: string
  orderValue: number
  purchaseDate: string | null
  shopperName: string
  shopperEmail: string
  status: string
  rebatePercentage: number
  bonusAmount: number
  shopperPayout: number
  submittedAt: string | null
  approvedAt: string | null
  createdAt: string
}

/**
 * Export enrollments to CSV/Excel
 */
export function useExportEnrollments(campaignId: string) {
  return useMutation({
    mutationFn: (params: { format?: 'csv' | 'xlsx'; status?: string }) =>
      get<ApiResponse<{
        data: EnrollmentExportRow[]
        totalCount: number
        campaignTitle: string
        exportedAt: string
        downloadUrl?: string
      }>>(`/api/campaigns/${campaignId}/enrollments/export`, { params }),
  })
}

/**
 * Enrollment pricing breakdown
 */
export interface EnrollmentPricing {
  enrollmentId: string
  orderValue: number
  rebatePercentage: number
  billRate: number
  platformFee: number
  bonusAmount: number
  shopperPayout: number
  brandCost: number
  gstAmount: number
  tdsAmount: number
  netBrandCharge: number
  platformMargin: number
}

/**
 * Fetch enrollment pricing details
 */
export function useEnrollmentPricing(id: string) {
  return useQuery({
    queryKey: [...enrollmentKeys.detail(id), 'pricing'] as const,
    queryFn: () => get<ApiResponse<EnrollmentPricing>>(`/api/enrollments/${id}/pricing`),
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
// OCR Scan Status Hooks
// ============================================

export type OCRScanStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface OCRExtractedData {
  orderId?: string
  orderDate?: string
  totalAmount?: number
  productName?: string
  sellerName?: string
  platform?: string
}

export interface OCRScanResult {
  scanId: string
  enrollmentId?: string
  campaignId?: string
  status: OCRScanStatus
  extractedData?: OCRExtractedData
  confidence?: number
  errorMessage?: string
  createdAt: string
  completedAt?: string
}

/**
 * Fetch OCR scan status for a receipt
 */
export function useScanStatus(scanId: string) {
  return useQuery({
    queryKey: [...enrollmentKeys.all, 'scan', scanId] as const,
    queryFn: () => get<ApiResponse<OCRScanResult>>(`/api/enrollments/scan-status/${scanId}`),
    enabled: !!scanId,
    staleTime: STALE_TIMES.REALTIME,
    refetchInterval: (query) => {
      // Poll every 2 seconds while scan is in progress
      const data = query.state.data
      if (data?.success && data.data) {
        const status = data.data.status
        if (status === 'pending' || status === 'processing') {
          return 2000
        }
      }
      return false
    },
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
 * Get enrollment stats summary
 */
export function useEnrollmentStats() {
  return useQuery({
    queryKey: [...enrollmentKeys.all, 'stats'] as const,
    queryFn: () => get<ApiResponse<{
      total: number
      pending: number
      awaitingReview: number
      approved: number
      rejected: number
      expired: number
      averageApprovalTime: number
      approvalRate: number
    }>>('/api/enrollments/stats'),
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
// Enrollment Transitions Hooks
// ============================================

export type EnrollmentEventType =
  | 'approve'
  | 'reject'
  | 'request_changes'
  | 'resubmit'
  | 'submit_deliverables'
  | 'withdraw'
  | 'expire'

export interface EnrollmentTransitionHistoryItem {
  id: string
  fromStatus: string | null
  toStatus: string
  triggeredBy: string
  triggeredByName: string
  reason: string | null
  createdAt: string
}

export interface EnrollmentTransitionsResponse {
  enrollmentId: string
  currentStatus: string
  allowedTransitions: EnrollmentEventType[]
  history: EnrollmentTransitionHistoryItem[]
}

/**
 * Fetch enrollment transitions (allowed actions and history)
 * Shows what actions are available and the audit trail
 */
export function useEnrollmentTransitions(id: string) {
  return useQuery({
    queryKey: [...enrollmentKeys.detail(id), 'transitions'] as const,
    queryFn: () => get<ApiResponse<EnrollmentTransitionsResponse>>(`/api/enrollments/${id}/transitions`),
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
