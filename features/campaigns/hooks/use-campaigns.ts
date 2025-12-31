/**
 * Campaign React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 * URL-based multi-tenancy: organizationId from URL params
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/api/client"
import { STALE_TIME, GC_TIME, PAGE_SIZE, DEFAULT_RETRY_CONFIG, createMutationErrorHandler, createStatsQueryKeyFactory } from "@/lib/utils/query-config"
import type { campaigns as campaignTypes, shared } from "@/brand-client"
import * as actions from "../actions/campaigns"
import type { CampaignStatusAction } from "../types"

// ============================================
// Query Keys - Using factory + custom extensions
// ============================================
const baseKeys = createStatsQueryKeyFactory("campaigns")

export const campaignKeys = {
	...baseKeys,
	// Extended keys not in base factory
	performance: (orgId: string, id: string, startDate?: string, endDate?: string) =>
		[...baseKeys.detail(orgId, id), "performance", startDate ?? "", endDate ?? ""] as const,
	deliverables: (orgId: string, campaignId: string) =>
		[...baseKeys.detail(orgId, campaignId), "deliverables"] as const,
	deliverable: (orgId: string, id: string) =>
		["campaign-deliverable", orgId, id] as const,
	pendingSubmissions: (orgId: string, skip?: number, take?: number) =>
		[...baseKeys.all(orgId), "pending-submissions", skip ?? 0, take ?? 50] as const,
}

// Deliverable types query keys (global catalog, not org-scoped)
export const deliverableKeys = {
	all: () => ["deliverable-types"] as const,
	list: (status?: string) => [...deliverableKeys.all(), "list", status] as const,
	detail: (id: string) => [...deliverableKeys.all(), "detail", id] as const,
}

// Submission query keys (org-scoped)
export const submissionKeys = {
	deliverable: (orgId: string, id: string) => ["deliverable-submission", orgId, id] as const,
	enrollment: (orgId: string, enrollmentId: string) => ["enrollment-submissions", orgId, enrollmentId] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * List campaigns for organization
 */
export function useCampaigns(
	orgId: string,
	params?: { skip?: number; take?: number; status?: shared.CampaignStatus }
) {
	return useQuery({
		queryKey: campaignKeys.list(orgId, params),
		queryFn: () =>
			client.organizations.listCampaigns(orgId, {
				skip: params?.skip ?? 0,
				take: params?.take ?? PAGE_SIZE.MEDIUM,
				status: params?.status,
			}),
		enabled: !!orgId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Search campaigns - uses listCampaigns with filtering
 */
export function useSearchCampaigns(orgId: string, params: { q: string; skip?: number; take?: number; status?: shared.CampaignStatus }) {
	return useQuery({
		queryKey: campaignKeys.search(orgId, params.q),
		queryFn: () =>
			client.organizations.listCampaigns(orgId, {
				skip: params.skip ?? 0,
				take: params.take ?? PAGE_SIZE.MEDIUM,
				status: params.status,
			}),
		enabled: !!orgId && params.q.length >= 2,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.SHORT,
	})
}

/**
 * Get single campaign
 */
export function useCampaign(orgId: string, id: string) {
	return useQuery({
		queryKey: campaignKeys.detail(orgId, id),
		queryFn: () => client.organizations.getCampaign(orgId, id),
		enabled: !!orgId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get campaign with stats
 * SSOT: Combines useCampaign cache with stats - avoids duplicate getCampaign call
 */
export function useCampaignWithStats(orgId: string, id: string) {
	// Get campaign from cache (uses useCampaign's cached data)
	const campaignQuery = useCampaign(orgId, id)
	const statsQuery = useCampaignStats(orgId, id)

	return {
		data: campaignQuery.data && statsQuery.data
			? { ...campaignQuery.data, stats: statsQuery.data }
			: undefined,
		isPending: campaignQuery.isPending || statsQuery.isPending,
		isLoading: campaignQuery.isLoading || statsQuery.isLoading,
		isError: campaignQuery.isError || statsQuery.isError,
		error: campaignQuery.error || statsQuery.error,
		refetch: async () => {
			await Promise.all([campaignQuery.refetch(), statsQuery.refetch()])
		},
	}
}

/**
 * Get campaign stats only
 * SSOT: Separate query for stats - different data from campaign detail
 */
export function useCampaignStats(orgId: string, id: string) {
	return useQuery({
		queryKey: campaignKeys.stats(orgId, id),
		queryFn: () => client.organizations.getCampaignStats(orgId, id),
		enabled: !!orgId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get campaign pricing - derives from campaign cache
 * SSOT: Uses SAME queryKey as useCampaign - shares cache, no duplicate API call
 */
export function useCampaignPricing(orgId: string, id: string) {
	return useQuery({
		// SSOT: Same queryKey as useCampaign - shares cache
		queryKey: campaignKeys.detail(orgId, id),
		queryFn: () => client.organizations.getCampaign(orgId, id),
		enabled: !!orgId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
		// Extract only pricing-related fields from cached campaign data
		select: (campaign) => ({
			campaignType: campaign.campaignType,
		}),
	})
}

/**
 * Get campaign performance
 */
export function useCampaignPerformance(orgId: string, id: string, params?: { startDate?: string; endDate?: string }) {
	return useQuery({
		queryKey: campaignKeys.performance(orgId, id, params?.startDate, params?.endDate),
		queryFn: () => client.organizations.getCampaignPerformance(orgId, id, params ?? {}),
		enabled: !!orgId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * List deliverable types (catalog) - from campaigns service
 */
export function useDeliverableTypes(status?: campaignTypes.DeliverableStatus) {
	return useQuery({
		queryKey: deliverableKeys.list(status),
		queryFn: () => client.campaigns.listDeliverables({ status }),
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get single deliverable type - from campaigns service
 */
export function useDeliverableType(id: string) {
	return useQuery({
		queryKey: deliverableKeys.detail(id),
		queryFn: () => client.campaigns.getDeliverable(id),
		enabled: !!id,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * List campaign deliverables
 */
export function useCampaignDeliverables(orgId: string, campaignId: string) {
	return useQuery({
		queryKey: campaignKeys.deliverables(orgId, campaignId),
		queryFn: () => client.organizations.listCampaignDeliverables(orgId, campaignId),
		enabled: !!orgId && !!campaignId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get single campaign deliverable
 */
export function useCampaignDeliverable(orgId: string, id: string) {
	return useQuery({
		queryKey: campaignKeys.deliverable(orgId, id),
		queryFn: () => client.organizations.getCampaignDeliverable(orgId, id),
		enabled: !!orgId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get deliverable submission
 */
export function useDeliverableSubmission(orgId: string, id: string) {
	return useQuery({
		queryKey: submissionKeys.deliverable(orgId, id),
		queryFn: () => client.organizations.getDeliverableSubmission(orgId, id),
		enabled: !!orgId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * List enrollment submissions for an enrollment
 */
export function useEnrollmentSubmissions(orgId: string, enrollmentId: string) {
	return useQuery({
		queryKey: submissionKeys.enrollment(orgId, enrollmentId),
		queryFn: () => client.organizations.listEnrollmentSubmissions(orgId, enrollmentId),
		enabled: !!orgId && !!enrollmentId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * List pending submissions for review
 */
export function usePendingSubmissions(orgId: string, params?: { skip?: number; take?: number }) {
	return useQuery({
		queryKey: campaignKeys.pendingSubmissions(orgId, params?.skip, params?.take),
		queryFn: () => client.organizations.listPendingSubmissions(orgId, params ?? {}),
		enabled: !!orgId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.SHORT,
		...DEFAULT_RETRY_CONFIG,
	})
}

// ============================================
// MUTATIONS - Via Server Actions
// All mutations pass organizationId for URL-based multi-tenancy
// ============================================

/**
 * Create campaign
 */
export function useCreateCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: Omit<Parameters<typeof actions.createCampaign>[0], "organizationId">) =>
			actions.createCampaign({ ...data, organizationId: orgId }),
		onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) }),
		onError: createMutationErrorHandler("create campaign"),
	})
}

/**
 * Update campaign
 */
export function useUpdateCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: { title?: string; description?: string; startDate?: string; endDate?: string; maxEnrollments?: number; isPublic?: boolean; termsAndConditions?: string } }) =>
			actions.updateCampaign({ organizationId: orgId, id, data }),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("update campaign"),
	})
}

/**
 * Delete campaign
 * Includes optimistic update for instant UI feedback
 */
export function useDeleteCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.deleteCampaign({ organizationId: orgId, id }),
		onMutate: async (id) => {
			// Cancel outgoing refetches
			await qc.cancelQueries({ queryKey: campaignKeys.lists(orgId) })

			// Snapshot previous value for rollback
			const previousLists = qc.getQueriesData({ queryKey: campaignKeys.lists(orgId) })

			// Optimistically remove from list caches
			qc.setQueriesData({ queryKey: campaignKeys.lists(orgId) }, (old: unknown) => {
				if (!old || typeof old !== "object" || !("campaigns" in old)) return old
				const data = old as { campaigns: Array<{ id: string }>; total?: number }
				return {
					...data,
					campaigns: data.campaigns.filter((c) => c.id !== id),
					total: (data.total ?? data.campaigns.length) - 1,
				}
			})

			return { previousLists }
		},
		onError: (err, _id, context) => {
			// Rollback on error
			if (context?.previousLists) {
				for (const [key, data] of context.previousLists) {
					qc.setQueryData(key, data)
				}
			}
			createMutationErrorHandler("delete campaign")(err)
		},
		onSettled: () => {
			// Always refetch after mutation settles
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
	})
}

/**
 * Update campaign status
 * SSOT: Uses CampaignStatusAction from actions/campaigns.ts
 */
export function useUpdateCampaignStatus(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, action, reason }: { id: string; action: CampaignStatusAction; reason?: string }) =>
			actions.updateCampaignStatus({ organizationId: orgId, id, action, reason }),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("update campaign status"),
	})
}

/**
 * Duplicate campaign
 */
export function useDuplicateCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.duplicateCampaign({ organizationId: orgId, id }),
		onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) }),
		onError: createMutationErrorHandler("duplicate campaign"),
	})
}

/**
 * Pause campaign - Convenience hook using updateCampaignStatus
 * SSOT: Uses unified updateCampaignStatus action with action="pause"
 */
export function usePauseCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
			actions.updateCampaignStatus({ organizationId: orgId, id, action: "pause", reason }),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("pause campaign"),
	})
}

/**
 * Resume campaign - Convenience hook using updateCampaignStatus
 * SSOT: Uses unified updateCampaignStatus action with action="resume"
 */
export function useResumeCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) =>
			actions.updateCampaignStatus({ organizationId: orgId, id, action: "resume" }),
		onSuccess: (_, id) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("resume campaign"),
	})
}

/**
 * End campaign - Convenience hook using updateCampaignStatus
 * SSOT: Uses unified updateCampaignStatus action with action="end"
 */
export function useEndCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) =>
			actions.updateCampaignStatus({ organizationId: orgId, id, action: "end" }),
		onSuccess: (_, id) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("end campaign"),
	})
}

/**
 * Export campaign enrollments
 */
export function useExportCampaignEnrollments(orgId: string) {
	return useMutation({
		mutationFn: (campaignId: string) => actions.exportCampaignEnrollments({ organizationId: orgId, campaignId }),
		onError: createMutationErrorHandler("export enrollments"),
	})
}

// ============================================
// DELIVERABLE MUTATIONS - Via Server Actions
// SSOT: All mutations use server actions for consistent validation
// ============================================

/**
 * Add deliverable to campaign
 */
export function useAddCampaignDeliverable(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: { campaignId: string; deliverableId: string; quantity?: number; isRequired?: boolean; instructions?: string }) =>
			actions.addCampaignDeliverable({ organizationId: orgId, ...data }),
		onSuccess: (_, { campaignId }) => {
			qc.invalidateQueries({ queryKey: campaignKeys.deliverables(orgId, campaignId) })
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, campaignId) })
		},
		onError: createMutationErrorHandler("add deliverable"),
	})
}

/**
 * Add multiple deliverables (batch)
 */
export function useAddCampaignDeliverablesBatch(orgId: string, campaignId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (deliverables: { deliverableId: string; quantity?: number; payout?: number }[]) =>
			actions.addCampaignDeliverablesBatch({ organizationId: orgId, campaignId, deliverables }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: campaignKeys.deliverables(orgId, campaignId) })
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, campaignId) })
		},
		onError: createMutationErrorHandler("add deliverables"),
	})
}

/**
 * Update campaign deliverable
 */
export function useUpdateCampaignDeliverable(orgId: string, campaignId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, ...data }: { id: string; quantity?: number; isRequired?: boolean; instructions?: string }) =>
			actions.updateCampaignDeliverable({ organizationId: orgId, campaignId, id, ...data }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: campaignKeys.deliverables(orgId, campaignId) })
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, campaignId) })
		},
		onError: createMutationErrorHandler("update deliverable"),
	})
}

/**
 * Remove deliverable from campaign
 */
export function useRemoveCampaignDeliverable(orgId: string, campaignId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) =>
			actions.removeCampaignDeliverable({ organizationId: orgId, campaignId, id }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: campaignKeys.deliverables(orgId, campaignId) })
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, campaignId) })
		},
		onError: createMutationErrorHandler("remove deliverable"),
	})
}

// ============================================
// STATUS MUTATIONS - Via Server Actions
// ============================================

/**
 * Activate campaign
 */
export function useActivateCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.updateCampaignStatus({ organizationId: orgId, id, action: "activate" }),
		onSuccess: (_, id) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("activate campaign"),
	})
}

/**
 * Archive campaign
 */
export function useArchiveCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.updateCampaignStatus({ organizationId: orgId, id, action: "archive" }),
		onSuccess: (_, id) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("archive campaign"),
	})
}

/**
 * Unarchive campaign
 */
export function useUnarchiveCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.updateCampaignStatus({ organizationId: orgId, id, action: "unarchive" }),
		onSuccess: (_, id) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("unarchive campaign"),
	})
}

/**
 * Submit campaign for approval
 */
export function useSubmitForApproval(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.updateCampaignStatus({ organizationId: orgId, id, action: "submit" }),
		onSuccess: (_, id) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("submit campaign"),
	})
}

/**
 * Update campaign pricing
 */
export function useUpdateCampaignPricing(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ campaignId, ...pricingData }: { campaignId: string; rebatePercentage?: number; billRate?: number; platformFee?: number; bonusAmount?: number }) =>
			actions.updateCampaignPricing({ organizationId: orgId, campaignId, ...pricingData }),
		onSuccess: (_, { campaignId }) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, campaignId) })
		},
		onError: createMutationErrorHandler("update pricing"),
	})
}

/**
 * Validate campaign before submission
 */
export function useValidateCampaign(orgId: string) {
	return useMutation({
		mutationFn: (id: string) => actions.validateCampaign({ organizationId: orgId, id }),
		onError: createMutationErrorHandler("validate campaign"),
	})
}
