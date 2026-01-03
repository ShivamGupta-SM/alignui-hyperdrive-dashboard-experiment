/**
 * Campaign React Query Hooks
 *
 * SIMPLIFIED: Consolidated hooks with factory patterns for status mutations.
 * URL-based multi-tenancy: organizationId from URL params.
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/api/client"
import {
	STALE_TIME,
	GC_TIME,
	PAGE_SIZE,
	DEFAULT_RETRY_CONFIG,
	createMutationErrorHandler,
	createStatsQueryKeyFactory,
} from "@/lib/utils/query-config"
import type { campaigns as campaignTypes, shared } from "@/brand-client"
import * as actions from "../actions/campaigns"
import type { CampaignStatusAction } from "../types"

// ============================================
// Query Keys
// ============================================

const baseKeys = createStatsQueryKeyFactory("campaigns")

export const campaignKeys = {
	...baseKeys,
	performance: (orgId: string, id: string, startDate?: string, endDate?: string) =>
		[...baseKeys.detail(orgId, id), "performance", startDate ?? "", endDate ?? ""] as const,
	deliverables: (orgId: string, campaignId: string) =>
		[...baseKeys.detail(orgId, campaignId), "deliverables"] as const,
	deliverable: (orgId: string, id: string) => ["campaign-deliverable", orgId, id] as const,
	pendingSubmissions: (orgId: string, skip?: number, take?: number) =>
		[...baseKeys.all(orgId), "pending-submissions", skip ?? 0, take ?? 50] as const,
}

export const deliverableKeys = {
	all: () => ["deliverable-types"] as const,
	list: (status?: string) => [...deliverableKeys.all(), "list", status] as const,
	detail: (id: string) => [...deliverableKeys.all(), "detail", id] as const,
}

export const submissionKeys = {
	deliverable: (orgId: string, id: string) => ["deliverable-submission", orgId, id] as const,
	enrollment: (orgId: string, enrollmentId: string) =>
		["enrollment-submissions", orgId, enrollmentId] as const,
}

// ============================================
// QUERIES
// ============================================

/** List campaigns for organization */
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

/** Search campaigns */
export function useSearchCampaigns(
	orgId: string,
	params: { q: string; skip?: number; take?: number; status?: shared.CampaignStatus }
) {
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

/** Get single campaign */
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

/** Get campaign with stats (combines two queries) */
export function useCampaignWithStats(orgId: string, id: string) {
	const campaignQuery = useCampaign(orgId, id)
	const statsQuery = useCampaignStats(orgId, id)

	return {
		data:
			campaignQuery.data && statsQuery.data
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

/** Get campaign stats */
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

/** Get campaign pricing (uses select to derive from campaign cache) */
export function useCampaignPricing(orgId: string, id: string) {
	return useQuery({
		queryKey: campaignKeys.detail(orgId, id),
		queryFn: () => client.organizations.getCampaign(orgId, id),
		enabled: !!orgId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
		select: (campaign) => ({ campaignType: campaign.campaignType }),
	})
}

/** Get campaign performance */
export function useCampaignPerformance(
	orgId: string,
	id: string,
	params?: { startDate?: string; endDate?: string }
) {
	return useQuery({
		queryKey: campaignKeys.performance(orgId, id, params?.startDate, params?.endDate),
		queryFn: () => client.organizations.getCampaignPerformance(orgId, id, params ?? {}),
		enabled: !!orgId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/** List deliverable types (catalog) */
export function useDeliverableTypes(status?: campaignTypes.DeliverableStatus) {
	return useQuery({
		queryKey: deliverableKeys.list(status),
		queryFn: () => client.campaigns.listDeliverables({ status }),
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/** Get single deliverable type */
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

/** List campaign deliverables */
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

/** Get single campaign deliverable */
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

/** Get deliverable submission */
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

/** List enrollment submissions */
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

/** List pending submissions for review */
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
// MUTATIONS - Core
// ============================================

/** Create campaign */
export function useCreateCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (
			data: Omit<Parameters<typeof actions.createCampaign>[0], "organizationId">
		) => actions.createCampaign({ ...data, organizationId: orgId }),
		onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) }),
		onError: createMutationErrorHandler("create campaign"),
	})
}

/** Update campaign */
export function useUpdateCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string
			data: {
				title?: string
				description?: string
				startDate?: string
				endDate?: string
				maxEnrollments?: number
				isPublic?: boolean
				termsAndConditions?: string
			}
		}) => actions.updateCampaign({ organizationId: orgId, id, data }),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("update campaign"),
	})
}

/** Delete campaign (with optimistic update) */
export function useDeleteCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.deleteCampaign({ organizationId: orgId, id }),
		onMutate: async (id) => {
			await qc.cancelQueries({ queryKey: campaignKeys.lists(orgId) })
			const previousLists = qc.getQueriesData({ queryKey: campaignKeys.lists(orgId) })

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
			if (context?.previousLists) {
				for (const [key, data] of context.previousLists) {
					qc.setQueryData(key, data)
				}
			}
			createMutationErrorHandler("delete campaign")(err)
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
	})
}

/** Duplicate campaign */
export function useDuplicateCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.duplicateCampaign({ organizationId: orgId, id }),
		onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) }),
		onError: createMutationErrorHandler("duplicate campaign"),
	})
}

/** Export campaign enrollments */
export function useExportCampaignEnrollments(orgId: string) {
	return useMutation({
		mutationFn: (campaignId: string) =>
			actions.exportCampaignEnrollments({ organizationId: orgId, campaignId }),
		onError: createMutationErrorHandler("export enrollments"),
	})
}

/** Update campaign pricing */
export function useUpdateCampaignPricing(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({
			campaignId,
			...pricingData
		}: {
			campaignId: string
			rebatePercentage?: number
			billRate?: number
			platformFee?: number
			bonusAmount?: number
		}) => actions.updateCampaignPricing({ organizationId: orgId, campaignId, ...pricingData }),
		onSuccess: (_, { campaignId }) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, campaignId) })
		},
		onError: createMutationErrorHandler("update pricing"),
	})
}

/** Validate campaign before submission */
export function useValidateCampaign(orgId: string) {
	return useMutation({
		mutationFn: (id: string) => actions.validateCampaign({ organizationId: orgId, id }),
		onError: createMutationErrorHandler("validate campaign"),
	})
}

// ============================================
// STATUS MUTATIONS - Factory pattern
// SIMPLIFIED: Single factory creates all status change hooks
// ============================================

function createStatusMutation(orgId: string, action: CampaignStatusAction, errorLabel: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (input: string | { id: string; reason?: string }) => {
			const id = typeof input === "string" ? input : input.id
			const reason = typeof input === "string" ? undefined : input.reason
			return actions.updateCampaignStatus({ organizationId: orgId, id, action, reason })
		},
		onSuccess: (_, input) => {
			const id = typeof input === "string" ? input : input.id
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler(errorLabel),
	})
}

/** Generic status update (accepts action parameter) */
export function useUpdateCampaignStatus(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({
			id,
			action,
			reason,
		}: {
			id: string
			action: CampaignStatusAction
			reason?: string
		}) => actions.updateCampaignStatus({ organizationId: orgId, id, action, reason }),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("update campaign status"),
	})
}

// Convenience hooks for specific status actions
export const usePauseCampaign = (orgId: string) =>
	createStatusMutation(orgId, "pause", "pause campaign")
export const useResumeCampaign = (orgId: string) =>
	createStatusMutation(orgId, "resume", "resume campaign")
export const useEndCampaign = (orgId: string) =>
	createStatusMutation(orgId, "end", "end campaign")
export const useActivateCampaign = (orgId: string) =>
	createStatusMutation(orgId, "activate", "activate campaign")
export const useArchiveCampaign = (orgId: string) =>
	createStatusMutation(orgId, "archive", "archive campaign")
export const useUnarchiveCampaign = (orgId: string) =>
	createStatusMutation(orgId, "unarchive", "unarchive campaign")
export const useSubmitForApproval = (orgId: string) =>
	createStatusMutation(orgId, "submit", "submit campaign")

// ============================================
// DELIVERABLE MUTATIONS
// ============================================

/** Add deliverable to campaign */
export function useAddCampaignDeliverable(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: {
			campaignId: string
			deliverableId: string
			quantity?: number
			isRequired?: boolean
			instructions?: string
		}) => actions.addCampaignDeliverable({ organizationId: orgId, ...data }),
		onSuccess: (_, { campaignId }) => {
			qc.invalidateQueries({ queryKey: campaignKeys.deliverables(orgId, campaignId) })
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, campaignId) })
		},
		onError: createMutationErrorHandler("add deliverable"),
	})
}

/** Add multiple deliverables (batch) */
export function useAddCampaignDeliverablesBatch(orgId: string, campaignId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (
			deliverables: { deliverableId: string; quantity?: number; payout?: number }[]
		) =>
			actions.addCampaignDeliverablesBatch({
				organizationId: orgId,
				campaignId,
				deliverables,
			}),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: campaignKeys.deliverables(orgId, campaignId) })
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, campaignId) })
		},
		onError: createMutationErrorHandler("add deliverables"),
	})
}

/** Update campaign deliverable */
export function useUpdateCampaignDeliverable(orgId: string, campaignId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({
			id,
			...data
		}: {
			id: string
			quantity?: number
			isRequired?: boolean
			instructions?: string
		}) => actions.updateCampaignDeliverable({ organizationId: orgId, campaignId, id, ...data }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: campaignKeys.deliverables(orgId, campaignId) })
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, campaignId) })
		},
		onError: createMutationErrorHandler("update deliverable"),
	})
}

/** Remove deliverable from campaign */
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
