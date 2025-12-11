// Campaign Types

import type { Product } from './product'

export type CampaignStatus =
  | 'draft'
  | 'pending_approval'
  | 'rejected'
  | 'approved'
  | 'active'
  | 'paused'
  | 'ended'
  | 'expired'
  | 'completed'
  | 'cancelled'
  | 'archived'

export type CampaignType = 'cashback' | 'barter' | 'hybrid'

export interface Campaign {
  id: string
  organizationId: string
  productId: string

  title: string
  description?: string
  type: CampaignType
  status: CampaignStatus
  isPublic: boolean

  // Dates
  startDate: Date
  endDate: Date
  submissionDeadlineDays: number

  // Limits
  maxEnrollments: number
  currentEnrollments: number

  // Billing (set by admin)
  billRate?: number
  platformFee?: number

  // Stats
  approvedCount: number
  rejectedCount: number
  pendingCount: number
  totalPayout: number

  // Relations
  product?: Product
  deliverables?: CampaignDeliverable[]

  createdAt: Date
  updatedAt: Date
}

export type DeliverableType =
  | 'order_screenshot'
  | 'delivery_photo'
  | 'product_review'
  | 'social_media_post'
  | 'unboxing_video'
  | 'custom'

export interface CampaignDeliverable {
  id: string
  campaignId: string
  type: DeliverableType
  title: string
  description?: string
  instructions?: string
  isRequired: boolean
  sortOrder: number
}

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
