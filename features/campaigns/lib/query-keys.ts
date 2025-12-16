/**
 * Campaign Query Keys Factory
 * 
 * @description
 * Centralized query keys for React Query.
 * Makes it easy to invalidate related queries.
 * 
 * @example
 * ```ts
 * // Invalidate all campaign lists
 * queryClient.invalidateQueries({ queryKey: campaignQueryKeys.lists() })
 * 
 * // Invalidate specific campaign
 * queryClient.invalidateQueries({ queryKey: campaignQueryKeys.detail(id) })
 * ```
 */
import type { CampaignFilters, CampaignSearchParams } from '../types'

export const campaignQueryKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignQueryKeys.all, 'list'] as const,
  list: (filters?: CampaignFilters) => [...campaignQueryKeys.lists(), filters] as const,
  search: (params: CampaignSearchParams) => [...campaignQueryKeys.all, 'search', params] as const,
  details: () => [...campaignQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignQueryKeys.details(), id] as const,
} as const

