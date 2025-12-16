/**
 * Campaign React Query Hooks
 * 
 * @description
 * Standardized React Query hooks for campaign data fetching.
 * Uses centralized API layer and query keys factory.
 */

"use client"

import { useQuery } from "@tanstack/react-query"
import { campaignQueryKeys } from '../lib/query-keys'
import * as campaignAPI from '../lib/api'
import type {
  Campaign,
  CampaignWithStats,
  CampaignSearchParams,
} from '../types'

/**
 * Hook: Search campaigns with filters
 * 
 * @description
 * Fetches campaigns from the API using React Query.
 * Automatically refetches when filters change.
 * Only searches if query is at least 2 characters (to avoid too many API calls).
 * 
 * @param params - Search parameters (query, pagination, status filter)
 * @returns React Query result with campaigns data
 * 
 * @example
 * ```tsx
 * function CampaignsPage() {
 *   const { data, isLoading } = useSearchCampaigns({ 
 *     q: "laptop", 
 *     status: "active" 
 *   })
 *   
 *   if (isLoading) return <Loading />
 *   return <CampaignList campaigns={data?.campaigns} />
 * }
 * ```
 */
export function useSearchCampaigns(params: CampaignSearchParams) {
  return useQuery({
    queryKey: campaignQueryKeys.search(params),
    queryFn: () => campaignAPI.searchCampaigns(params),
    enabled: params.q.length >= 2, // Only search if query is at least 2 characters
    staleTime: 60 * 1000, // 1 minute - search results don't need frequent updates
    refetchOnWindowFocus: false, // Don't refetch on focus - user might be reading results
  })
}

/**
 * Hook: Get single campaign by ID
 * 
 * @description
 * Fetches a single campaign from the API.
 * Automatically refetches when ID changes.
 * 
 * @param id - Campaign ID
 * @returns React Query result with campaign data
 * 
 * @example
 * ```tsx
 * function CampaignDetailPage({ id }: { id: string }) {
 *   const { data, isLoading } = useCampaign(id)
 *   
 *   if (isLoading) return <Loading />
 *   if (!data) return <NotFound />
 *   return <CampaignView campaign={data} />
 * }
 * ```
 */
export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignQueryKeys.detail(id),
    queryFn: () => campaignAPI.getCampaignById(id),
    enabled: !!id, // Only fetch if ID exists
  })
}

/**
 * Hook: Get campaign with stats by ID
 * 
 * @description
 * Fetches a campaign with statistics from the API.
 * 
 * @param id - Campaign ID
 * @returns React Query result with campaign and stats
 */
export function useCampaignWithStats(id: string) {
  return useQuery({
    queryKey: [...campaignQueryKeys.detail(id), 'stats'],
    queryFn: () => campaignAPI.getCampaignWithStats(id),
    enabled: !!id,
  })
}

