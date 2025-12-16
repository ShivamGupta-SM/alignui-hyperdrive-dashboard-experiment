/**
 * Campaign API - Single source of truth for all campaign operations
 * 
 * @description
 * All campaign-related API calls go through here.
 * This makes it easier for AI to understand data flow and maintain consistency.
 */

import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { campaigns } from '@/lib/encore-client'
import type {
  Campaign,
  CampaignWithStats,
  CampaignSearchParams,
} from '../types'

/**
 * Search campaigns with filters
 * 
 * @param params - Search parameters (query, pagination, status)
 * @returns Campaign search results
 */
export async function searchCampaigns(
  params: CampaignSearchParams
): Promise<campaigns.SearchCampaignsResponse> {
  const client = getEncoreBrowserClient()
  return client.campaigns.searchCampaigns({
    q: params.q,
    skip: params.skip,
    take: params.take,
    status: params.status,
  })
}

/**
 * Get campaign by ID
 * 
 * @param id - Campaign ID
 * @returns Campaign data
 */
export async function getCampaignById(id: string): Promise<Campaign> {
  const client = getEncoreBrowserClient()
  return client.campaigns.getCampaign(id)
}

/**
 * Get campaign with stats by ID
 * 
 * @param id - Campaign ID
 * @returns Campaign with statistics
 */
export async function getCampaignWithStats(id: string): Promise<CampaignWithStats> {
  const client = getEncoreBrowserClient()
  return client.campaigns.getCampaignWithStats(id)
}

/**
 * List campaigns with filters
 * 
 * @param params - List parameters (pagination, filters)
 * @returns List of campaigns
 */
export async function listCampaigns(
  params?: campaigns.ListCampaignsParams
): Promise<campaigns.ListCampaignsResponse> {
  const client = getEncoreBrowserClient()
  return client.campaigns.listCampaigns(params || {})
}

