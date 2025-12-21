/**
 * Campaign React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 * No unnecessary wrapper layers
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import { STALE_TIME } from "@/lib/utils/query-config"
import type { campaigns as campaignTypes, shared } from "@/lib/api/encore-client"
import * as actions from "../actions/campaigns"

// ============================================
// Client Instance
// ============================================
const client = getEncoreBrowserClient()

// ============================================
// Query Keys
// ============================================
export const campaignKeys = {
	all: (orgId: string) => ["campaigns", orgId] as const,
	lists: (orgId: string) => [...campaignKeys.all(orgId), "list"] as const,
	list: (orgId: string, filters?: Record<string, unknown>) => [...campaignKeys.lists(orgId), filters] as const,
	search: (orgId: string, params: { q: string }) => [...campaignKeys.all(orgId), "search", params] as const,
	details: (orgId: string) => [...campaignKeys.all(orgId), "detail"] as const,
	detail: (orgId: string, id: string) => [...campaignKeys.details(orgId), id] as const,
	stats: (orgId: string, id: string) => [...campaignKeys.detail(orgId, id), "stats"] as const,
	deliverables: (campaignId: string) => ["campaign-deliverables", campaignId] as const,
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
			client.campaigns.listCampaigns({
				organizationId: orgId,
				skip: params?.skip ?? 0,
				take: params?.take ?? 50,
				status: params?.status,
			}),
		enabled: !!orgId,
	})
}

/**
 * Search campaigns
 */
export function useSearchCampaigns(orgId: string, params: { q: string; skip?: number; take?: number; status?: shared.CampaignStatus }) {
	return useQuery({
		queryKey: campaignKeys.search(orgId, { q: params.q }),
		queryFn: () =>
			client.campaigns.searchCampaigns({
				q: params.q,
				skip: params.skip ?? 0,
				take: params.take ?? 50,
				status: params.status,
			}),
		enabled: !!orgId && params.q.length >= 2,
		staleTime: STALE_TIME.SHORT,
	})
}

/**
 * Get single campaign
 */
export function useCampaign(orgId: string, id: string) {
	return useQuery({
		queryKey: campaignKeys.detail(orgId, id),
		queryFn: () => client.campaigns.getCampaign(id),
		enabled: !!orgId && !!id,
	})
}

/**
 * Get campaign with stats
 */
export function useCampaignWithStats(orgId: string, id: string) {
	return useQuery({
		queryKey: campaignKeys.stats(orgId, id),
		queryFn: async () => {
			const [campaign, stats] = await Promise.all([
				client.campaigns.getCampaign(id),
				client.campaigns.getCampaignStats(id),
			])
			return { ...campaign, stats }
		},
		enabled: !!orgId && !!id,
	})
}

/**
 * Get campaign stats only
 */
export function useCampaignStats(id: string) {
	return useQuery({
		queryKey: ["campaign-stats", id],
		queryFn: () => client.campaigns.getCampaignStats(id),
		enabled: !!id,
	})
}

/**
 * Get campaign pricing
 */
export function useCampaignPricing(id: string) {
	return useQuery({
		queryKey: ["campaign-pricing", id],
		queryFn: () => client.campaigns.getCampaignPricing(id),
		enabled: !!id,
	})
}

/**
 * Get campaign performance
 */
export function useCampaignPerformance(id: string, params?: { startDate?: string; endDate?: string }) {
	return useQuery({
		queryKey: ["campaign-performance", id, params],
		queryFn: () => client.campaigns.getCampaignPerformance(id, params ?? {}),
		enabled: !!id,
	})
}

/**
 * List deliverable types (catalog)
 */
export function useDeliverableTypes(status?: campaignTypes.DeliverableStatus) {
	return useQuery({
		queryKey: ["deliverable-types", status],
		queryFn: () => client.campaigns.listDeliverables({ status }),
		staleTime: STALE_TIME.MEDIUM,
	})
}

/**
 * Get single deliverable type
 */
export function useDeliverableType(id: string) {
	return useQuery({
		queryKey: ["deliverable-type", id],
		queryFn: () => client.campaigns.getDeliverable(id),
		enabled: !!id,
		staleTime: STALE_TIME.MEDIUM,
	})
}

/**
 * List campaign deliverables
 */
export function useCampaignDeliverables(campaignId: string) {
	return useQuery({
		queryKey: campaignKeys.deliverables(campaignId),
		queryFn: () => client.campaigns.listCampaignDeliverables(campaignId),
		enabled: !!campaignId,
	})
}

// ============================================
// MUTATIONS - Via Server Actions
// ============================================

/**
 * Create campaign
 */
export function useCreateCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: actions.createCampaign,
		onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) }),
	})
}

/**
 * Update campaign
 */
export function useUpdateCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<campaignTypes.UpdateCampaignRequest> }) =>
			actions.updateCampaign({ id, data }),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
	})
}

/**
 * Delete campaign
 */
export function useDeleteCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.deleteCampaign({ id }),
		onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) }),
	})
}

/**
 * Update campaign status
 */
export function useUpdateCampaignStatus(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, action }: { id: string; action: "submit" | "activate" | "cancel" | "end" | "complete" | "archive" | "unarchive" }) =>
			actions.updateCampaignStatus({ id, action }),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
	})
}

/**
 * Duplicate campaign
 */
export function useDuplicateCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.duplicateCampaign({ id, organizationId: orgId }),
		onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) }),
	})
}

/**
 * Pause campaign
 */
export function usePauseCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, reason }: { id: string; reason?: string }) => actions.pauseCampaign({ id, reason: reason ?? "Paused by user" }),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
	})
}

/**
 * Resume campaign
 */
export function useResumeCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.resumeCampaign({ id }),
		onSuccess: (_, id) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
	})
}

/**
 * End campaign
 */
export function useEndCampaign(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.endCampaign({ id }),
		onSuccess: (_, id) => {
			qc.invalidateQueries({ queryKey: campaignKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) })
		},
	})
}

/**
 * Export campaign enrollments
 */
export function useExportCampaignEnrollments() {
	return useMutation({
		mutationFn: (campaignId: string) => actions.exportCampaignEnrollments({ campaignId }),
	})
}

// ============================================
// DELIVERABLE MUTATIONS - Direct Client (no SSR cache needed)
// ============================================

/**
 * Add deliverable to campaign
 */
export function useAddCampaignDeliverable() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: campaignTypes.AddCampaignDeliverableRequest) =>
			client.campaigns.addCampaignDeliverable(data),
		onSuccess: (_, { campaignId }) => {
			qc.invalidateQueries({ queryKey: campaignKeys.deliverables(campaignId) })
		},
	})
}

/**
 * Add multiple deliverables (batch)
 */
export function useAddCampaignDeliverablesBatch(campaignId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (deliverables: { deliverableId: string; quantity?: number; payout?: number }[]) =>
			client.campaigns.addCampaignDeliverablesBatch(campaignId, { deliverables }),
		onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.deliverables(campaignId) }),
	})
}

/**
 * Update campaign deliverable
 */
export function useUpdateCampaignDeliverable(campaignId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: { quantity?: number; isRequired?: boolean; instructions?: string } }) =>
			client.campaigns.updateCampaignDeliverable(id, data),
		onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.deliverables(campaignId) }),
	})
}

/**
 * Remove deliverable from campaign
 */
export function useRemoveCampaignDeliverable(campaignId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => client.campaigns.removeCampaignDeliverable(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.deliverables(campaignId) }),
	})
}


