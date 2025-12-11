'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { enrollments, shared } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'
import { dashboardKeys, enrollmentKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { enrollmentKeys }

// Re-export types from Encore for convenience
export type Enrollment = enrollments.Enrollment
export type EnrollmentWithRelations = enrollments.EnrollmentWithRelations
export type EnrollmentStatus = shared.EnrollmentStatus
export type EnrollmentPricing = enrollments.EnrollmentPricing
export type EnrollmentExportRow = enrollments.EnrollmentExportRow
export type OCRScanResult = enrollments.OCRScanResult
export type OCRScanStatus = enrollments.OCRScanStatus
export type OCRExtractedData = enrollments.OCRExtractedData
export type EnrollmentEventType = enrollments.EnrollmentEventType

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

// ============================================
// Query Hooks
// ============================================

export function useEnrollments(filters: EnrollmentFilters = {}) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: enrollmentKeys.list(filters),
    queryFn: () => {
      if (filters.campaignId) {
        return client.enrollments.listCampaignEnrollments(filters.campaignId, {
          skip: filters.page ? (filters.page - 1) * (filters.limit || 20) : 0,
          take: filters.limit || 20,
          status: filters.status as shared.EnrollmentStatus | undefined,
        })
      }
      return client.enrollments.listMyEnrollments({
        skip: filters.page ? (filters.page - 1) * (filters.limit || 20) : 0,
        take: filters.limit || 20,
        status: filters.status as shared.EnrollmentStatus | undefined,
        campaignId: filters.campaignId,
      })
    },
    staleTime: STALE_TIMES.REALTIME,
  })
}

export function useEnrollment(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: enrollmentKeys.detail(id),
    queryFn: () => client.enrollments.getEnrollment(id),
    enabled: !!id,
    staleTime: STALE_TIMES.REALTIME,
  })
}

export function usePendingEnrollments() {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: enrollmentKeys.pending(),
    queryFn: () => client.enrollments.listMyEnrollments({
      status: 'awaiting_review',
      take: 10,
    }),
    staleTime: STALE_TIMES.REALTIME,
  })
}

// ============================================
// SSR Hydration Hooks
// ============================================

/**
 * Fetch enrollments data for SSR hydration
 * Used by the enrollments page to hydrate React Query cache
 */
export function useEnrollmentsData(campaignId?: string, status?: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: enrollmentKeys.data(status),
    queryFn: async () => {
      if (campaignId) {
        const [enrollmentsData, stats] = await Promise.all([
          client.enrollments.listCampaignEnrollments(campaignId, {
            take: 50,
            status: status as shared.EnrollmentStatus | undefined,
          }),
          client.enrollments.getEnrollmentStats(campaignId),
        ])
        return {
          enrollments: enrollmentsData.data,
          allEnrollments: enrollmentsData.data,
          stats: {
            total: stats.total,
            pending: stats.awaitingReview,
            overdue: 0, // Not tracked in new schema
            approved: stats.approved,
            rejected: stats.rejected,
            totalValue: stats.totalOrderValue,
          },
        }
      }
      // For non-campaign-specific view
      const enrollmentsData = await client.enrollments.listMyEnrollments({
        take: 50,
        status: status as shared.EnrollmentStatus | undefined,
      })
      return {
        enrollments: enrollmentsData.data,
        allEnrollments: enrollmentsData.data,
        stats: {
          total: enrollmentsData.total,
          pending: 0,
          overdue: 0,
          approved: 0,
          rejected: 0,
          totalValue: 0,
        },
      }
    },
    staleTime: STALE_TIMES.REALTIME,
  })
}

/**
 * Fetch enrollment detail data for SSR hydration
 * Used by the enrollment detail page to hydrate React Query cache
 */
export function useEnrollmentDetailData(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...enrollmentKeys.detail(id), 'ssr'] as const,
    queryFn: async () => {
      const enrollment = await client.enrollments.getEnrollment(id)
      return { enrollment }
    },
    enabled: !!id,
    staleTime: STALE_TIMES.REALTIME,
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
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data?: { remarks?: string }) =>
      client.enrollments.approveEnrollment(id, { remarks: data?.remarks }),
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
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: { reasons: string[]; notes?: string }) =>
      client.enrollments.rejectEnrollment(id, {
        reason: data.reasons.join(', '),
        feedback: data.notes ? { notes: data.notes } : undefined,
      }),
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
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: { requestedChanges: string[]; deadline?: string; notes?: string }) =>
      client.enrollments.requestChanges(id, {
        feedback: data.requestedChanges.join('\n') + (data.notes ? `\n\nNotes: ${data.notes}` : ''),
      }),
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
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: { newDeadline: string; reason?: string }) =>
      client.enrollments.extendDeadline(id, { newExpiryDate: data.newDeadline }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(id) })
    },
  })
}

/**
 * Update enrollment status (generic)
 */
export function useUpdateEnrollmentStatus(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: async (data: { status: EnrollmentStatus; reason?: string }) => {
      switch (data.status) {
        case 'approved':
          return client.enrollments.approveEnrollment(id, { remarks: data.reason })
        case 'permanently_rejected':
          return client.enrollments.rejectEnrollment(id, { reason: data.reason || 'Rejected' })
        case 'withdrawn':
          return client.enrollments.withdrawEnrollment(id)
        default:
          throw new Error(`Unsupported status transition: ${data.status}`)
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

/**
 * Bulk update enrollments
 */
export function useBulkUpdateEnrollments() {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: async (data: { ids: string[]; status: EnrollmentStatus; reason?: string }) => {
      if (data.status === 'approved') {
        return client.enrollments.bulkApproveEnrollments({
          enrollmentIds: data.ids,
          remarks: data.reason,
        })
      } else if (data.status === 'permanently_rejected') {
        return client.enrollments.bulkRejectEnrollments({
          enrollmentIds: data.ids,
          reason: data.reason || 'Rejected',
        })
      }
      throw new Error(`Bulk ${data.status} not supported`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })
}

// ============================================
// Enrollment Export & Pricing Hooks
// ============================================

/**
 * Export enrollments to CSV/Excel
 */
export function useExportEnrollments(campaignId: string) {
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (params: { format?: 'csv' | 'xlsx'; status?: string }) =>
      client.enrollments.exportEnrollments(campaignId, {
        status: params.status as shared.EnrollmentStatus | undefined,
      }),
  })
}

/**
 * Fetch enrollment pricing details
 */
export function useEnrollmentPricing(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...enrollmentKeys.detail(id), 'pricing'] as const,
    queryFn: () => client.enrollments.getEnrollmentPricing(id),
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
  })
}

// ============================================
// OCR Scan Status Hooks
// ============================================

/**
 * Fetch OCR scan status for a receipt
 */
export function useScanStatus(scanId: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...enrollmentKeys.all, 'scan', scanId] as const,
    queryFn: () => client.enrollments.getScanStatus(scanId),
    enabled: !!scanId,
    staleTime: STALE_TIMES.REALTIME,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data) {
        const status = data.status
        if (status === 'pending' || status === 'processing') {
          return 2000
        }
      }
      return false
    },
  })
}

/**
 * Get enrollment stats summary
 */
export function useEnrollmentStats(campaignId: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...enrollmentKeys.all, 'stats', campaignId] as const,
    queryFn: () => client.enrollments.getEnrollmentStats(campaignId),
    enabled: !!campaignId,
    staleTime: STALE_TIMES.STANDARD,
  })
}

// ============================================
// Enrollment Transitions Hooks
// ============================================

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
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...enrollmentKeys.detail(id), 'transitions'] as const,
    queryFn: async () => {
      const result = await client.enrollments.getEnrollmentTransitions(id)
      return {
        enrollmentId: result.enrollmentId,
        allowedTransitions: result.allowedTransitions,
        // History not available directly - would need separate endpoint
        history: [] as EnrollmentTransitionHistoryItem[],
      }
    },
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
  })
}
