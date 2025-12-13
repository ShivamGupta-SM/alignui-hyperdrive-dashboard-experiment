'use client'

import type { campaigns, shared } from '@/lib/encore-browser'

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
