/**
 * Campaign Feature Types
 * 
 * @description
 * Single source of truth for all campaign-related types.
 * Re-exports from Encore client and defines feature-specific types.
 */

// Re-export from Encore client (source of truth)
import type { campaigns, shared } from '@/lib/encore-client'

export type Campaign = campaigns.Campaign
export type CampaignWithStats = campaigns.CampaignWithStats
export type CampaignStats = campaigns.CampaignStats
export type CampaignPricing = campaigns.CampaignPricing
export type CampaignPerformance = campaigns.CampaignPerformance
export type CampaignStatus = shared.CampaignStatus
export type CampaignType = shared.CampaignType

// Feature-specific types
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

export interface CampaignSearchParams {
  q: string
  skip?: number
  take?: number
  status?: CampaignStatus
}

export interface PayoutEstimate {
  orderValue: number
  shopperPayout: number
  brandCost: number
  gstAmount: number
  platformFee: number
}

// DeliverableType - Frontend-only type (not in Encore shared types)
export type DeliverableType =
  | "order_screenshot"
  | "delivery_photo"
  | "product_review"
  | "social_media_post"
  | "unboxing_video"
  | "custom"

// Form types
export interface CampaignFormData {
  // Step 1: Basic Info
  productId: string
  title: string
  description?: string
  type: CampaignType
  isPublic: boolean

  // Step 2: Dates & Limits
  startDate: Date
  endDate: Date
  maxEnrollments: number
  submissionDeadlineDays: number

  // Step 3: Deliverables
  deliverables: {
    id: string
    type: DeliverableType
    title: string
    instructions?: string
    isRequired: boolean
  }[]

  // Step 4: Terms
  terms: string[]
  minOrderValue?: number
}

