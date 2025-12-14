"use client"

import type { campaigns, shared } from "@/lib/encore-browser"

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

export interface PayoutEstimate {
	orderValue: number
	shopperPayout: number
	brandCost: number
	gstAmount: number
	platformFee: number
}

export interface CampaignSearchParams {
	q: string
	skip?: number
	take?: number
	status?: CampaignStatus
}

// ============================================
// React Query Hooks
// ============================================

import { useQuery } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/encore-browser"

/**
 * Search campaigns hook
 */
export function useSearchCampaigns(params: CampaignSearchParams) {
	return useQuery({
		queryKey: ["campaigns", "search", params],
		queryFn: async () => {
			const client = getEncoreBrowserClient()
			return await client.campaigns.searchCampaigns({
				q: params.q,
				skip: params.skip,
				take: params.take,
				status: params.status,
			})
		},
		enabled: params.q.length >= 2, // Only search if query is at least 2 characters
		staleTime: 60 * 1000, // 1 minute (increased for better performance)
		refetchOnWindowFocus: false, // Disable auto-refetch for search results
	})
}
