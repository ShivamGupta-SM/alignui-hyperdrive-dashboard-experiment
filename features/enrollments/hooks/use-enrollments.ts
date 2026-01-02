/**
 * Enrollment React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 * URL-based multi-tenancy: organizationId from URL params
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/api/client"
import { STALE_TIME, GC_TIME, PAGE_SIZE, DEFAULT_RETRY_CONFIG, createMutationErrorHandler, createQueryKeyFactory } from "@/lib/utils/query-config"
import type { shared } from "@/brand-client"
import * as actions from "../actions/enrollments"
import type { EnrollmentFilters } from "../types"

// ============================================
// Query Keys - Using factory + custom extensions
// ============================================
const baseKeys = createQueryKeyFactory("enrollments")

export const enrollmentKeys = {
	...baseKeys,
	// Override list to include enrollment-specific filters
	list: (orgId: string, filters?: EnrollmentFilters) =>
		[...baseKeys.lists(orgId), filters?.status ?? "all", filters?.campaignId ?? "", filters?.skip ?? 0, filters?.take ?? 50] as const,
	// Override detail to include campaignId
	detail: (orgId: string, campaignId: string, id: string) => [...baseKeys.details(orgId), campaignId, id] as const,
	// Extended keys not in base factory
	campaign: (orgId: string, campaignId: string) => ["campaign-enrollments", orgId, campaignId] as const,
	pricing: (orgId: string, campaignId: string, id: string) => ["enrollment-pricing", orgId, campaignId, id] as const,
	stats: (orgId: string, campaignId: string) => ["enrollment-stats", orgId, campaignId] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * List enrollments (organization enrollments)
 */
export function useEnrollments(orgId: string, filters: EnrollmentFilters = {}) {
	return useQuery({
		queryKey: enrollmentKeys.list(orgId, filters),
		queryFn: () =>
			client.organizations.listOrganizationEnrollments(orgId, {
				status: filters.status,
				campaignId: filters.campaignId,
				skip: filters.skip ?? 0,
				take: filters.take ?? PAGE_SIZE.MEDIUM,
			}),
		enabled: !!orgId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * List campaign enrollments
 */
export function useCampaignEnrollments(orgId: string, campaignId: string, params?: { skip?: number; take?: number }) {
	return useQuery({
		queryKey: enrollmentKeys.campaign(orgId, campaignId),
		queryFn: () =>
			client.organizations.listCampaignEnrollments(orgId, campaignId, {
				skip: params?.skip ?? 0,
				take: params?.take ?? PAGE_SIZE.LARGE,
			}),
		enabled: !!orgId && !!campaignId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get single enrollment
 */
export function useEnrollment(orgId: string, campaignId: string, id: string) {
	return useQuery({
		queryKey: enrollmentKeys.detail(orgId, campaignId, id),
		queryFn: () => client.organizations.getEnrollmentForBrand(orgId, campaignId, id),
		enabled: !!orgId && !!campaignId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get enrollment detail (includes history, shopper info, etc.)
 * SSOT: This is the primary query for enrollment detail data
 */
export function useEnrollmentDetail(orgId: string, campaignId: string, id: string) {
	return useQuery({
		queryKey: enrollmentKeys.detail(orgId, campaignId, id),
		queryFn: () => client.organizations.getEnrollmentDetailForBrand(orgId, campaignId, id),
		enabled: !!orgId && !!campaignId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get enrollment transitions - derives from enrollment detail cache
 * SSOT: Uses SAME queryKey as useEnrollmentDetail to share cache (NO duplicate API call)
 * Uses `select` to extract only the history/transitions from cached data
 */
export function useEnrollmentTransitions(orgId: string, campaignId: string, id: string) {
	return useQuery({
		// SSOT: Same queryKey as useEnrollmentDetail - shares cache, no duplicate API call
		queryKey: enrollmentKeys.detail(orgId, campaignId, id),
		queryFn: () => client.organizations.getEnrollmentDetailForBrand(orgId, campaignId, id),
		enabled: !!orgId && !!campaignId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
		// Extract only transitions from the cached detail data
		select: (detail) => ({ transitions: detail.history }),
	})
}

/**
 * Get enrollment pricing
 */
export function useEnrollmentPricing(orgId: string, campaignId: string, id: string) {
	return useQuery({
		queryKey: enrollmentKeys.pricing(orgId, campaignId, id),
		queryFn: () => client.organizations.getEnrollmentPricingForBrand(orgId, campaignId, id),
		enabled: !!orgId && !!campaignId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

// ============================================
// MUTATIONS - Via Server Actions
// ============================================

/**
 * Update enrollment status (approve/reject)
 */
export function useUpdateEnrollmentStatus(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ campaignId, id, status, reason }: { campaignId: string; id: string; status: "approved" | "rejected"; reason?: string }) =>
			actions.updateEnrollmentStatus({ organizationId: orgId, campaignId, id, status, reason }),
		onSuccess: (_, { campaignId, id }) => {
			qc.invalidateQueries({ queryKey: enrollmentKeys.detail(orgId, campaignId, id) })
			qc.invalidateQueries({ queryKey: enrollmentKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("update enrollment status"),
	})
}

/**
 * Bulk approve enrollments - uses server action for consistency
 */
export function useBulkApproveEnrollments(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ enrollmentIds, remarks }: { enrollmentIds: string[]; remarks?: string }) =>
			actions.bulkUpdateEnrollments({ organizationId: orgId, ids: enrollmentIds, status: "approved", reason: remarks }),
		onSuccess: () => qc.invalidateQueries({ queryKey: enrollmentKeys.lists(orgId) }),
		onError: createMutationErrorHandler("bulk approve enrollments"),
	})
}

/**
 * Bulk reject enrollments - uses server action for consistency
 */
export function useBulkRejectEnrollments(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ enrollmentIds, reason }: { enrollmentIds: string[]; reason: string }) =>
			actions.bulkUpdateEnrollments({ organizationId: orgId, ids: enrollmentIds, status: "rejected", reason }),
		onSuccess: () => qc.invalidateQueries({ queryKey: enrollmentKeys.lists(orgId) }),
		onError: createMutationErrorHandler("bulk reject enrollments"),
	})
}

/**
 * Approve enrollment
 * Includes optimistic update for instant UI feedback
 */
export function useApproveEnrollment(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ campaignId, id, remarks }: { campaignId: string; id: string; remarks?: string }) =>
			actions.updateEnrollmentStatus({ organizationId: orgId, campaignId, id, status: "approved", reason: remarks }),
		onMutate: async ({ campaignId, id }) => {
			// Cancel outgoing refetches to prevent overwriting optimistic update
			await qc.cancelQueries({ queryKey: enrollmentKeys.detail(orgId, campaignId, id) })
			await qc.cancelQueries({ queryKey: enrollmentKeys.lists(orgId) })

			// Snapshot previous values for rollback
			const previousDetail = qc.getQueryData(enrollmentKeys.detail(orgId, campaignId, id))
			const previousLists = qc.getQueriesData({ queryKey: enrollmentKeys.lists(orgId) })

			// Optimistically update the detail cache
			qc.setQueryData(enrollmentKeys.detail(orgId, campaignId, id), (old: unknown) => {
				if (!old || typeof old !== "object") return old
				return { ...old, status: "approved" }
			})

			// Optimistically update list caches
			qc.setQueriesData({ queryKey: enrollmentKeys.lists(orgId) }, (old: unknown) => {
				if (!old || typeof old !== "object" || !("enrollments" in old)) return old
				const data = old as { enrollments: Array<{ id: string; status?: string }> }
				return {
					...data,
					enrollments: data.enrollments.map((e) =>
						e.id === id ? { ...e, status: "approved" } : e
					),
				}
			})

			return { previousDetail, previousLists }
		},
		onError: (err, { campaignId, id }, context) => {
			// Rollback on error
			if (context?.previousDetail) {
				qc.setQueryData(enrollmentKeys.detail(orgId, campaignId, id), context.previousDetail)
			}
			if (context?.previousLists) {
				for (const [key, data] of context.previousLists) {
					qc.setQueryData(key, data)
				}
			}
			createMutationErrorHandler("approve enrollment")(err)
		},
		onSettled: (_, __, { campaignId, id }) => {
			// Always refetch after mutation settles
			qc.invalidateQueries({ queryKey: enrollmentKeys.detail(orgId, campaignId, id) })
			qc.invalidateQueries({ queryKey: enrollmentKeys.lists(orgId) })
		},
	})
}

/**
 * Reject enrollment
 * Includes optimistic update for instant UI feedback
 */
export function useRejectEnrollment(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ campaignId, id, reason }: { campaignId: string; id: string; reason: string }) =>
			actions.updateEnrollmentStatus({ organizationId: orgId, campaignId, id, status: "rejected", reason }),
		onMutate: async ({ campaignId, id }) => {
			// Cancel outgoing refetches to prevent overwriting optimistic update
			await qc.cancelQueries({ queryKey: enrollmentKeys.detail(orgId, campaignId, id) })
			await qc.cancelQueries({ queryKey: enrollmentKeys.lists(orgId) })

			// Snapshot previous values for rollback
			const previousDetail = qc.getQueryData(enrollmentKeys.detail(orgId, campaignId, id))
			const previousLists = qc.getQueriesData({ queryKey: enrollmentKeys.lists(orgId) })

			// Optimistically update the detail cache
			qc.setQueryData(enrollmentKeys.detail(orgId, campaignId, id), (old: unknown) => {
				if (!old || typeof old !== "object") return old
				return { ...old, status: "rejected" }
			})

			// Optimistically update list caches
			qc.setQueriesData({ queryKey: enrollmentKeys.lists(orgId) }, (old: unknown) => {
				if (!old || typeof old !== "object" || !("enrollments" in old)) return old
				const data = old as { enrollments: Array<{ id: string; status?: string }> }
				return {
					...data,
					enrollments: data.enrollments.map((e) =>
						e.id === id ? { ...e, status: "rejected" } : e
					),
				}
			})

			return { previousDetail, previousLists }
		},
		onError: (err, { campaignId, id }, context) => {
			// Rollback on error
			if (context?.previousDetail) {
				qc.setQueryData(enrollmentKeys.detail(orgId, campaignId, id), context.previousDetail)
			}
			if (context?.previousLists) {
				for (const [key, data] of context.previousLists) {
					qc.setQueryData(key, data)
				}
			}
			createMutationErrorHandler("reject enrollment")(err)
		},
		onSettled: (_, __, { campaignId, id }) => {
			// Always refetch after mutation settles
			qc.invalidateQueries({ queryKey: enrollmentKeys.detail(orgId, campaignId, id) })
			qc.invalidateQueries({ queryKey: enrollmentKeys.lists(orgId) })
		},
	})
}

/**
 * Request changes on enrollment deliverables
 */
export function useRequestChanges(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ campaignId, id, feedback }: { campaignId: string; id: string; feedback: string }) =>
			actions.requestChanges({ organizationId: orgId, campaignId, id, feedback }),
		onSuccess: (_, { campaignId, id }) => {
			qc.invalidateQueries({ queryKey: enrollmentKeys.detail(orgId, campaignId, id) })
			qc.invalidateQueries({ queryKey: enrollmentKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("request changes"),
	})
}

/**
 * Extend enrollment deadline
 * ✅ FIX: Uses server action for consistent validation and cache revalidation
 */
export function useExtendDeadline(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ campaignId, id, expiresAt }: { campaignId: string; id: string; expiresAt: string }) =>
			actions.extendDeadline({ organizationId: orgId, campaignId, id, expiresAt }),
		onSuccess: (_, { campaignId, id }) => {
			qc.invalidateQueries({ queryKey: enrollmentKeys.detail(orgId, campaignId, id) })
			qc.invalidateQueries({ queryKey: enrollmentKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("extend enrollment deadline"),
	})
}

// Note: submitDeliverables, updateDeliverable, deleteDeliverable methods
// are not available in the organizations service API.
// These operations are handled by the shopper client, not the brand client.

/**
 * Get enrollment stats for a campaign
 */
export function useEnrollmentStats(orgId: string, campaignId: string) {
	return useQuery({
		queryKey: enrollmentKeys.stats(orgId, campaignId),
		queryFn: () => client.organizations.getEnrollmentStats(orgId, campaignId),
		enabled: !!orgId && !!campaignId,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Export enrollments to Excel
 */
export function useExportEnrollments(orgId: string) {
	return useMutation({
		mutationFn: ({ campaignId, status }: { campaignId: string; status?: shared.EnrollmentStatus }) =>
			actions.exportEnrollments({ organizationId: orgId, campaignId, status }),
		onError: createMutationErrorHandler("export enrollments"),
	})
}

// Types are exported from @/features/enrollments (feature index)
