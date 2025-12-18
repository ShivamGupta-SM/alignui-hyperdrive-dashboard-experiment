/**
 * Enrollment React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import { STALE_TIME } from "@/lib/utils/query-config"
import type { enrollments as enrollmentTypes, shared } from "@/lib/api/encore-client"
import * as actions from "../actions/enrollments"
import type { EnrollmentFilters } from "../types"

// ============================================
// Client Instance
// ============================================
const client = getEncoreBrowserClient()

// ============================================
// Query Keys
// ============================================
export const enrollmentKeys = {
	all: (orgId: string) => ["enrollments", orgId] as const,
	lists: (orgId: string) => [...enrollmentKeys.all(orgId), "list"] as const,
	list: (orgId: string, filters?: EnrollmentFilters) => [...enrollmentKeys.lists(orgId), filters] as const,
	details: (orgId: string) => [...enrollmentKeys.all(orgId), "detail"] as const,
	detail: (orgId: string, id: string) => [...enrollmentKeys.details(orgId), id] as const,
	transitions: (id: string) => ["enrollment-transitions", id] as const,
	campaign: (campaignId: string) => ["campaign-enrollments", campaignId] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * List enrollments (my enrollments for shoppers)
 */
export function useEnrollments(orgId: string, filters: EnrollmentFilters = {}) {
	return useQuery({
		queryKey: enrollmentKeys.list(orgId, filters),
		queryFn: () =>
			client.enrollments.listMyEnrollments({
				status: filters.status as shared.EnrollmentStatus | undefined,
				campaignId: filters.campaignId,
				skip: filters.skip ?? 0,
				take: filters.take ?? 10,
			}),
		enabled: !!orgId,
		staleTime: STALE_TIME.SHORT,
	})
}

/**
 * List organization enrollments (for brands)
 */
export function useOrganizationEnrollments(
	orgId: string,
	params?: { skip?: number; take?: number; status?: shared.EnrollmentStatus; campaignId?: string }
) {
	return useQuery({
		queryKey: enrollmentKeys.list(orgId, params),
		queryFn: () =>
			client.enrollments.listOrganizationEnrollments({
				organizationId: orgId,
				skip: params?.skip ?? 0,
				take: params?.take ?? 50,
				status: params?.status,
				campaignId: params?.campaignId,
			}),
		enabled: !!orgId,
	})
}

/**
 * List campaign enrollments
 */
export function useCampaignEnrollments(campaignId: string, params?: { skip?: number; take?: number }) {
	return useQuery({
		queryKey: enrollmentKeys.campaign(campaignId),
		queryFn: () =>
			client.enrollments.listCampaignEnrollments(campaignId, {
				skip: params?.skip ?? 0,
				take: params?.take ?? 100,
			}),
		enabled: !!campaignId,
	})
}

/**
 * Get single enrollment
 */
export function useEnrollment(orgId: string, id: string) {
	return useQuery({
		queryKey: enrollmentKeys.detail(orgId, id),
		queryFn: () => client.enrollments.getEnrollment(id),
		enabled: !!orgId && !!id,
	})
}

/**
 * Get enrollment detail (includes history, shopper info, etc.)
 */
export function useEnrollmentDetail(id: string) {
	return useQuery({
		queryKey: ["enrollment-detail", id],
		queryFn: () => client.enrollments.getEnrollmentDetail(id),
		enabled: !!id,
	})
}

/**
 * Get enrollment transitions
 */
export function useEnrollmentTransitions(id: string) {
	return useQuery({
		queryKey: enrollmentKeys.transitions(id),
		queryFn: () => client.enrollments.getEnrollmentTransitions(id),
		enabled: !!id,
	})
}

/**
 * Get enrollment pricing
 */
export function useEnrollmentPricing(id: string) {
	return useQuery({
		queryKey: ["enrollment-pricing", id],
		queryFn: () => client.enrollments.getEnrollmentPricing(id),
		enabled: !!id,
	})
}

// ============================================
// MUTATIONS - Via Server Actions
// ============================================

/**
 * Update enrollment status (approve/reject/withdraw)
 */
export function useUpdateEnrollmentStatus(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
			actions.updateEnrollmentStatus({ id, status: status as "approved" | "rejected" | "withdrawn", reason }),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: enrollmentKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: enrollmentKeys.lists(orgId) })
		},
	})
}

/**
 * Bulk update enrollments
 */
export function useBulkUpdateEnrollments(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ ids, status, reason }: { ids: string[]; status: string; reason?: string }) =>
			actions.bulkUpdateEnrollments({ ids, status: status as "approved" | "rejected", reason }),
		onSuccess: () => qc.invalidateQueries({ queryKey: enrollmentKeys.lists(orgId) }),
	})
}

/**
 * Approve enrollment (direct client - no SSR cache needed)
 */
export function useApproveEnrollment(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
			client.enrollments.approveEnrollment(id, { remarks }),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: enrollmentKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: enrollmentKeys.lists(orgId) })
		},
	})
}

/**
 * Reject enrollment
 */
export function useRejectEnrollment(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, reason }: { id: string; reason: string }) =>
			client.enrollments.rejectEnrollment(id, { reason }),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: enrollmentKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: enrollmentKeys.lists(orgId) })
		},
	})
}

/**
 * Withdraw enrollment
 */
export function useWithdrawEnrollment(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => client.enrollments.withdrawEnrollment(id),
		onSuccess: (_, id) => {
			qc.invalidateQueries({ queryKey: enrollmentKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: enrollmentKeys.lists(orgId) })
		},
	})
}

/**
 * Submit deliverables (batch)
 */
export function useSubmitDeliverables(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ enrollmentId, data }: { enrollmentId: string; data: enrollmentTypes.SubmitDeliverablesRequest }) =>
			client.enrollments.submitDeliverables(enrollmentId, data),
		onSuccess: () => qc.invalidateQueries({ queryKey: enrollmentKeys.lists(orgId) }),
	})
}

/**
 * Update deliverable proof
 */
export function useUpdateDeliverable(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: { proofLink?: string; proofScreenshot?: string } }) =>
			client.enrollments.updateDeliverable(id, data),
		onSuccess: () => qc.invalidateQueries({ queryKey: enrollmentKeys.lists(orgId) }),
	})
}

// Re-export types
export type * from "../types"
