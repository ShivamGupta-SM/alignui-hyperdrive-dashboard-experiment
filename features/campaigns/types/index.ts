/**
 * Campaign Feature Types
 *
 * @description
 * Single source of truth for all campaign-related types.
 * Re-exports from Encore client and defines feature-specific types.
 */

// Re-export from Encore client (source of truth)
// Note: Campaign data comes from organizations service when accessed via org-scoped endpoints
import type { campaigns, organizations, shared } from "@/brand-client"
import type { BaseFilters } from "@/lib/types/base"

// Campaign types - from organizations namespace (org-scoped endpoints)
export type Campaign = campaigns.Campaign
export type CampaignWithStats = organizations.CampaignWithStats
export type CampaignStats = organizations.CampaignStats
export type CampaignPricing = organizations.CampaignPricing
export type CampaignPerformance = organizations.CampaignPerformance
export type CampaignPerformanceResponse = organizations.CampaignPerformanceResponse
export type CampaignStatus = shared.CampaignStatus
export type CampaignType = shared.CampaignType

// Deliverable types - from organizations namespace
export type Deliverable = campaigns.Deliverable
export type DeliverableStatus = campaigns.DeliverableStatus
export type CampaignDeliverableResponse = organizations.CampaignDeliverableResponse
export type DeliverableSubmissionResponse = organizations.DeliverableSubmissionResponse

// Request/Response types - from organizations namespace
export type CreateCampaignRequest = organizations.CreateCampaignRequest
// Note: ProductImageItem is exported from @/features/products/types (SSOT)

// Custom types for API requests (not generated in client)
export interface UpdateCampaignRequest {
	title?: string
	description?: string
	startDate?: string
	endDate?: string
	maxEnrollments?: number
	campaignType?: shared.CampaignType
	isPublic?: boolean
}

export interface AddCampaignDeliverableRequest {
	campaignId: string
	deliverableId: string
	quantity?: number
	isRequired?: boolean
	instructions?: string
}

export interface ListCampaignsParams {
	skip?: number
	take?: number
	status?: shared.CampaignStatus
	search?: string
	sortBy?: "createdAt" | "title" | "startDate" | "endDate"
	sortOrder?: "asc" | "desc"
}

// Feature-specific types
export interface CampaignFilters extends BaseFilters {
	status?: CampaignStatus
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

// DeliverableType - Frontend-only type for form handling
// Maps to backend `campaigns.Deliverable.category` field
export type DeliverableType =
	| "order_screenshot"
	| "delivery_photo"
	| "product_review"
	| "social_media_post"
	| "unboxing_video"
	| "custom"

// Form types are exported from validation.ts (Zod schema source of truth)
// Import from @/features/campaigns (CampaignFormInput, CampaignFormData)

// SSOT: All campaign status action types
export const CAMPAIGN_STATUS_ACTIONS = [
	"submit",
	"activate",
	"cancel",
	"pause",
	"resume",
	"end",
	"complete",
	"archive",
	"unarchive",
] as const

export type CampaignStatusAction = (typeof CAMPAIGN_STATUS_ACTIONS)[number]
