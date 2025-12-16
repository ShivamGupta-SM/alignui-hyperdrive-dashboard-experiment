/**
 * Campaign Validation Schemas
 * 
 * @description
 * Single source of truth for all campaign-related validation.
 * Uses Zod for type-safe validation with type inference.
 */

import { z } from 'zod'
import { VALIDATION_CONSTANTS } from '@/lib/types/constants'

/**
 * Campaign status schema
 */
export const campaignStatusSchema = z.enum([
	"draft",
	"pending_approval",
	"rejected",
	"approved",
	"active",
	"paused",
	"ended",
	"expired",
	"completed",
	"cancelled",
	"archived",
])

/**
 * Campaign form schema for multi-step form
 * 
 * @description
 * Used for the campaign creation form with all steps.
 * Includes validation for deliverables and date ranges.
 */
export const campaignFormSchema = z
	.object({
		productId: z.string().min(1, "Please select a product"),
		title: z
			.string()
			.min(1, "Campaign title is required")
			.min(VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MIN_LENGTH, `Campaign title must be at least ${VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MIN_LENGTH} characters`)
			.max(VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MAX_LENGTH, `Campaign title must be less than ${VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MAX_LENGTH} characters`),
		description: z
			.string()
			.max(VALIDATION_CONSTANTS.CAMPAIGN_DESCRIPTION_MAX_LENGTH, `Description must be less than ${VALIDATION_CONSTANTS.CAMPAIGN_DESCRIPTION_MAX_LENGTH} characters`)
			.optional()
			.or(z.literal("")),
		type: z.enum(["cashback", "barter", "hybrid"], {
			message: "Please select a campaign type",
		}),
		isPublic: z.boolean(),
		startDate: z.date({
			message: "Please select a valid start date",
		}),
		endDate: z.date({
			message: "Please select a valid end date",
		}),
		maxEnrollments: z
			.number({
				message: "Please enter a valid number",
			})
			.int("Maximum enrollments must be a whole number")
			.min(VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MIN, `Maximum enrollments must be at least ${VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MIN}`)
			.max(VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MAX, `Maximum enrollments must be less than ${VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MAX.toLocaleString()}`),
		submissionDeadlineDays: z
			.number({
				message: "Please enter a valid number",
			})
			.int("Submission deadline must be a whole number")
			.min(VALIDATION_CONSTANTS.SUBMISSION_DEADLINE_MIN_DAYS, `Submission deadline must be at least ${VALIDATION_CONSTANTS.SUBMISSION_DEADLINE_MIN_DAYS} day`)
			.max(VALIDATION_CONSTANTS.SUBMISSION_DEADLINE_MAX_DAYS, `Submission deadline must be less than ${VALIDATION_CONSTANTS.SUBMISSION_DEADLINE_MAX_DAYS} days`),
		deliverables: z
			.array(
				z.object({
					id: z.string(),
					type: z.string().min(1, "Deliverable type is required"),
					title: z
						.string()
						.min(1, "Deliverable title is required")
						.max(VALIDATION_CONSTANTS.MESSAGE_MAX_LENGTH, `Title must be less than ${VALIDATION_CONSTANTS.MESSAGE_MAX_LENGTH} characters`),
					isRequired: z.boolean(),
					instructions: z
						.string()
						.max(VALIDATION_CONSTANTS.NOTES_MAX_LENGTH, `Instructions must be less than ${VALIDATION_CONSTANTS.NOTES_MAX_LENGTH} characters`)
						.optional()
						.or(z.literal("")),
				})
			)
			.min(1, "At least one deliverable is required"),
		terms: z.array(z.string()).optional(),
	})
	.refine((data) => data.endDate > data.startDate, {
		message: "End date must be after start date",
		path: ["endDate"],
	})
	.refine(
		(data) => {
			// At least one required deliverable
			return data.deliverables.some((d) => d.isRequired)
		},
		{
			message: "At least one deliverable must be marked as required",
			path: ["deliverables"],
		}
	)

/**
 * Campaign schema for basic validation
 */
export const campaignSchema = z
	.object({
		title: z
			.string()
			.min(1, "Campaign title is required")
			.min(VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MIN_LENGTH, `Campaign title must be at least ${VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MIN_LENGTH} characters`)
			.max(VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MAX_LENGTH, `Campaign title must be less than ${VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MAX_LENGTH} characters`),
		description: z.string().max(VALIDATION_CONSTANTS.CAMPAIGN_DESCRIPTION_MAX_LENGTH, `Description must be less than ${VALIDATION_CONSTANTS.CAMPAIGN_DESCRIPTION_MAX_LENGTH} characters`).optional(),
		productId: z.string().min(1, "Product is required"),
		type: z.enum(["cashback", "barter", "hybrid"]),
		startDate: z.date({ message: "Start date is required" }),
		endDate: z.date({ message: "End date is required" }),
		maxEnrollments: z
			.number()
			.min(VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MIN, `Maximum enrollments must be at least ${VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MIN}`)
			.max(VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MAX, `Maximum enrollments must be less than ${VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MAX.toLocaleString()}`),
		billRate: z
			.number()
			.min(0, "Bill rate must be positive")
			.max(100, "Bill rate must be less than 100%")
			.optional(),
	})
	.refine((data) => data.endDate > data.startDate, {
		message: "End date must be after start date",
		path: ["endDate"],
	})

/**
 * API request body schema for creating campaigns
 */
export const createCampaignBodySchema = z.object({
	title: z
		.string()
		.min(1, "Campaign title is required")
		.min(3, "Campaign title must be at least 3 characters")
		.max(VALIDATION_CONSTANTS.MESSAGE_MAX_LENGTH, `Campaign title must be less than ${VALIDATION_CONSTANTS.MESSAGE_MAX_LENGTH} characters`),
	description: z.string().max(VALIDATION_CONSTANTS.REASON_MAX_LENGTH, `Description must be less than ${VALIDATION_CONSTANTS.REASON_MAX_LENGTH} characters`).optional(),
	productId: z.string().min(1, "Product is required"),
	type: z.enum(["cashback", "barter", "hybrid"]),
	isPublic: z.boolean(),
	maxEnrollments: z
		.number()
		.int()
		.min(1, "Maximum enrollments must be at least 1")
		.max(VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MAX, `Maximum enrollments must be less than ${VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MAX.toLocaleString()}`),
	submissionDeadlineDays: z
		.number()
		.int()
		.min(1, "Submission deadline must be at least 1 day")
		.max(VALIDATION_CONSTANTS.SUBMISSION_DEADLINE_MAX_DAYS, `Submission deadline must be less than ${VALIDATION_CONSTANTS.SUBMISSION_DEADLINE_MAX_DAYS} days`),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
})

/**
 * API request body schema for updating campaigns
 */
export const updateCampaignBodySchema = createCampaignBodySchema.partial().extend({
	status: campaignStatusSchema.optional(),
})

// Type exports
export type CampaignFormInput = z.infer<typeof campaignFormSchema>
export type CampaignFormData = z.infer<typeof campaignSchema>
export type CreateCampaignBody = z.infer<typeof createCampaignBodySchema>
export type UpdateCampaignBody = z.infer<typeof updateCampaignBodySchema>
export type CampaignStatus = z.infer<typeof campaignStatusSchema>

