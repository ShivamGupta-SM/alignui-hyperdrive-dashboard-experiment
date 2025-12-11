// Server-side data fetching for campaigns
// This file uses the Encore backend client for type-safe API calls
import 'server-only'

import { getEncoreClient, type campaigns as campaignsApi, type shared } from '@/lib/encore'
import { mockCampaigns } from '@/lib/mocks'
import type { Campaign } from '@/lib/types'

// Feature flag to control whether to use Encore or mock data
const USE_ENCORE = !!process.env.ENCORE_API_URL

export interface GetCampaignsParams {
  status?: string
  search?: string
  page?: number
  pageSize?: number
}

export interface CampaignStats {
  total: number
  active: number
  endingSoon: number
  draft: number
  pending: number
  completed: number
  totalEnrollments: number
  totalPayout: number
}

export interface CampaignsData {
  campaigns: Campaign[]
  allCampaigns: Campaign[]
  stats: CampaignStats
}

/**
 * Convert Encore CampaignWithStats to Frontend Campaign type
 * This includes enrollment stats and product relation
 */
function toFrontendCampaignWithStats(campaign: campaignsApi.CampaignWithStats): Campaign {
  return {
    id: campaign.id,
    organizationId: campaign.organizationId,
    productId: campaign.productId,
    title: campaign.title,
    description: campaign.description,
    type: campaign.campaignType,
    status: campaign.status as Campaign['status'],
    isPublic: campaign.isPublic,
    startDate: new Date(campaign.startDate),
    endDate: new Date(campaign.endDate),
    submissionDeadlineDays: campaign.enrollmentExpiryDays,
    maxEnrollments: campaign.maxEnrollments,
    currentEnrollments: campaign.currentEnrollments,
    billRate: campaign.billRate,
    platformFee: campaign.platformFee,
    approvedCount: campaign.approvedCount,
    rejectedCount: campaign.rejectedCount,
    pendingCount: campaign.pendingCount,
    totalPayout: campaign.totalPayout,
    // Include product relation if available
    product: campaign.product
      ? {
          id: campaign.product.id,
          organizationId: campaign.organizationId,
          name: campaign.product.name,
          price: campaign.product.price,
          imageUrl: campaign.product.productImages?.[0],
          images: campaign.product.productImages || [],
          sku: '',
          category: '',
          platform: '',
          campaignCount: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      : undefined,
    createdAt: new Date(campaign.createdAt),
    updatedAt: new Date(campaign.updatedAt),
  }
}

/**
 * Get campaigns from Encore backend
 * Uses CampaignWithStats which includes enrollment stats and product relation
 */
async function fetchCampaignsFromEncore(params?: GetCampaignsParams): Promise<Campaign[]> {
  const client = getEncoreClient()

  const encoreParams: campaignsApi.ListCampaignsParams = {
    skip: params?.page ? (params.page - 1) * (params.pageSize || 10) : 0,
    take: params?.pageSize || 50,
    status: params?.status && params.status !== 'all'
      ? params.status as shared.CampaignStatus
      : undefined,
  }

  // listCampaigns returns CampaignWithStats[] with enrollment counts, totalPayout, product
  const response = await client.campaigns.listCampaigns(encoreParams)
  return response.data.map(toFrontendCampaignWithStats)
}

export function getCampaigns(params?: GetCampaignsParams): Campaign[] {
  // For now, use mock data synchronously
  // The async version is getCampaignsData
  let campaigns = [...mockCampaigns]

  // Filter by status
  if (params?.status && params.status !== 'all') {
    campaigns = campaigns.filter(c => c.status === params.status)
  }

  // Search by title
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    campaigns = campaigns.filter(c =>
      c.title.toLowerCase().includes(searchLower)
    )
  }

  return campaigns
}

/**
 * Get all campaigns data for SSR hydration
 */
export async function getCampaignsData(statusFilter?: string): Promise<CampaignsData> {
  if (USE_ENCORE) {
    try {
      const allCampaigns = await fetchCampaignsFromEncore()
      const filteredCampaigns = statusFilter && statusFilter !== 'all'
        ? await fetchCampaignsFromEncore({ status: statusFilter })
        : allCampaigns
      const stats = getCampaignStats(allCampaigns)

      return {
        campaigns: filteredCampaigns,
        allCampaigns,
        stats,
      }
    } catch (error) {
      console.error('Failed to fetch campaigns from Encore, falling back to mocks:', error)
    }
  }

  // Fallback to mock data
  const allCampaigns = getCampaigns()
  const filteredCampaigns = getCampaigns({
    status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined
  })
  const stats = getCampaignStats(allCampaigns)

  return {
    campaigns: filteredCampaigns,
    allCampaigns,
    stats,
  }
}

export function getCampaignById(id: string): Campaign | null {
  return mockCampaigns.find(c => c.id === id) || null
}

/**
 * Get campaign by ID from Encore backend
 * Returns CampaignWithStats with enrollment counts, totalPayout, product
 */
export async function getCampaignByIdAsync(id: string): Promise<Campaign | null> {
  if (USE_ENCORE) {
    try {
      const client = getEncoreClient()
      // getCampaign returns CampaignWithStats with stats and product relation
      const campaign = await client.campaigns.getCampaign(id)
      return toFrontendCampaignWithStats(campaign)
    } catch (error) {
      console.error('Failed to fetch campaign from Encore:', error)
    }
  }
  return getCampaignById(id)
}

/**
 * Get campaign detail data for SSR hydration
 */
export async function getCampaignDetailData(id: string): Promise<CampaignDetailData | null> {
  const campaign = await getCampaignByIdAsync(id)
  if (!campaign) return null

  // Get enrollments for this campaign (mock)
  const enrollments = mockCampaigns.length > 0 ? [] : [] // Would fetch real enrollments

  return {
    campaign,
    enrollments,
  }
}

export interface CampaignDetailData {
  campaign: Campaign
  enrollments: { id: string; status: string }[]
}

export function getCampaignStats(campaigns: Campaign[]) {
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const endingSoon = activeCampaigns.filter(c => new Date(c.endDate) <= sevenDaysFromNow)

  return {
    total: campaigns.length,
    active: activeCampaigns.length,
    endingSoon: endingSoon.length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    pending: campaigns.filter(c => c.status === 'pending_approval').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalEnrollments: campaigns.reduce((acc, c) => acc + c.currentEnrollments, 0),
    totalPayout: campaigns.reduce((acc, c) => acc + c.totalPayout, 0),
  }
}
