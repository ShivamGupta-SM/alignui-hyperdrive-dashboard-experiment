/**
 * Campaign API - Single source of truth for all campaign operations
 * 
 * @description
 * All campaign-related API calls go through here.
 * This makes it easier for AI to understand data flow and maintain consistency.
 */

import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import type { campaigns } from "@/lib/api/encore-client"
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
): Promise<{
  data: Campaign[]
  total: number
  skip: number
  take: number
  hasMore: boolean
}> {
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
  // Get campaign and stats separately, then combine
  const [campaign, stats] = await Promise.all([
    client.campaigns.getCampaign(id),
    client.campaigns.getCampaignStats(id),
  ])
  return { ...campaign, stats } as CampaignWithStats
}

/**
 * List campaigns with filters
 * 
 * @param params - List parameters (pagination, filters)
 * @returns List of campaigns
 */
export async function listCampaigns(
  params?: campaigns.ListCampaignsParams
): Promise<{
  data: CampaignWithStats[]
  total: number
  skip: number
  take: number
  hasMore: boolean
}> {
  const client = getEncoreBrowserClient()
  return client.campaigns.listCampaigns(params || {})
}

/**
 * List deliverable types
 * 
 * @param params - Filter parameters
 * @returns Deliverables response
 */
export async function listDeliverables(params?: { status?: campaigns.DeliverableStatus }) {
  const client = getEncoreBrowserClient()
  return client.campaigns.listDeliverables(params || {})
}

/**
 * Get deliverable by ID
 * 
 * @param id - Deliverable ID
 * @returns Deliverable data
 */
export async function getDeliverable(id: string) {
  const client = getEncoreBrowserClient()
  return client.campaigns.getDeliverable(id)
}

/**
 * List campaign deliverables
 * 
 * @param campaignId - Campaign ID
 * @returns Campaign deliverables response
 */
export async function listCampaignDeliverables(campaignId: string) {
  const client = getEncoreBrowserClient()
  return client.campaigns.listCampaignDeliverables(campaignId)
}

/**
 * Add deliverable to campaign
 * 
 * @param data - Deliverable data
 * @returns Added deliverable
 */
export async function addCampaignDeliverable(data: campaigns.AddCampaignDeliverableRequest) {
  const client = getEncoreBrowserClient()
  return client.campaigns.addCampaignDeliverable(data)
}

/**
 * Add multiple deliverables to campaign (batch)
 * 
 * @param campaignId - Campaign ID
 * @param data - Batch deliverables data
 * @returns Batch response
 */
export async function addCampaignDeliverablesBatch(
  campaignId: string,
  data: { deliverables: Array<{ deliverableId: string; quantity?: number; payout?: number }> }
) {
  const client = getEncoreBrowserClient()
  return client.campaigns.addCampaignDeliverablesBatch(campaignId, data)
}

/**
 * Update campaign deliverable
 * 
 * @param id - Campaign deliverable ID
 * @param data - Update data
 * @returns Updated deliverable
 */
export async function updateCampaignDeliverable(
  id: string,
  data: { quantity?: number; isRequired?: boolean; instructions?: string }
) {
  const client = getEncoreBrowserClient()
  return client.campaigns.updateCampaignDeliverable(id, data)
}

/**
 * Remove deliverable from campaign
 * 
 * @param id - Campaign deliverable ID
 */
export async function removeCampaignDeliverable(id: string) {
  const client = getEncoreBrowserClient()
  return client.campaigns.removeCampaignDeliverable(id)
}

