// Campaign Types
// Re-export from Encore (source of truth) for backwards compatibility

import type { campaigns, shared } from "@/lib/encore-client"

// Re-export Encore types as source of truth
export type CampaignStatus = shared.CampaignStatus
export type CampaignType = shared.CampaignType
export type Campaign = campaigns.Campaign
export type CampaignWithStats = campaigns.CampaignWithStats
export type CampaignDeliverable = campaigns.CampaignDeliverableResponse

// DeliverableType - Frontend-only type (not in Encore shared types)
// Used for form inputs and UI display
// Note: Backend uses deliverable.category field, but this type is for UI forms
export type DeliverableType =
	| "order_screenshot"
	| "delivery_photo"
	| "product_review"
	| "social_media_post"
	| "unboxing_video"
	| "custom"

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
