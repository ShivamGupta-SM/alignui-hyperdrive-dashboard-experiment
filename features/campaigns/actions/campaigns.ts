"use server"

/**
 * Campaign Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 * URL-based multi-tenancy: organizationId from URL params passed to all actions
 */

import { revalidateTag } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"
import {
	organizationIdSchema,
	campaignIdSchema,
	campaignStatusActionSchema,
	CAMPAIGN_TYPES,
} from "@/lib/utils"

// =============================================================================
// Schemas - Built on SSOT schemas from @/lib/utils/validations
// =============================================================================

const createCampaignSchema = organizationIdSchema.extend({
	productId: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional(),
	startDate: z.string(),
	endDate: z.string(),
	maxEnrollments: z.number().int().positive(),
	campaignType: z.enum(CAMPAIGN_TYPES),
	isPublic: z.boolean(),
})

const updateCampaignSchema = campaignIdSchema.extend({
	data: z.object({
		title: z.string().optional(),
		description: z.string().optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
		maxEnrollments: z.number().int().positive().optional(),
		isPublic: z.boolean().optional(),
		termsAndConditions: z.string().optional(),
	}),
})

const duplicateCampaignSchema = campaignIdSchema.extend({
	newTitle: z.string().optional(),
})

const updateStatusSchema = campaignIdSchema.extend({
	action: campaignStatusActionSchema,
	reason: z.string().optional(), // For pause action
})

// =============================================================================
// Actions - Use organization-scoped endpoints for multi-tenancy
// =============================================================================

/**
 * Create campaign
 */
export const createCampaign = authAction
	.inputSchema(createCampaignSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, ...campaignData } = parsedInput
		const result = await ctx.client.organizations.createCampaign(organizationId, campaignData)
		revalidateTag("campaigns")
		revalidateTag("dashboard")
		return result
	})

/**
 * Update campaign
 */
export const updateCampaign = authAction
	.inputSchema(updateCampaignSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, id, data } = parsedInput
		const result = await ctx.client.organizations.updateCampaign(organizationId, id, data)
		revalidateTag("campaigns")
		revalidateTag(`campaign-${id}`)
		return result
	})

/**
 * Delete campaign
 */
export const deleteCampaign = authAction
	.inputSchema(campaignIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, id } = parsedInput
		await ctx.client.organizations.deleteCampaign(organizationId, id)
		revalidateTag("campaigns")
		revalidateTag(`campaign-${id}`)
		revalidateTag("dashboard")
		return { success: true }
	})

/**
 * Duplicate campaign - uses API's native duplicate endpoint
 */
export const duplicateCampaign = authAction
	.inputSchema(duplicateCampaignSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, id, newTitle } = parsedInput
		const newCampaign = await ctx.client.organizations.duplicateCampaign(organizationId, id, { newTitle })
		revalidateTag("campaigns")
		return newCampaign
	})

/**
 * Update campaign status
 * Note: API returns Campaign type for all status change operations
 */
export const updateCampaignStatus = authAction
	.inputSchema(updateStatusSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, id, action, reason } = parsedInput

		switch (action) {
			case "submit":
				// Submit for approval (draft → pending_approval)
				await ctx.client.organizations.submitCampaign(organizationId, id)
				break
			case "activate":
				// Activate campaign (approved → active)
				await ctx.client.organizations.activateCampaign(organizationId, id)
				break
			case "cancel":
				// Cancel campaign (draft/pending_approval → cancelled)
				await ctx.client.organizations.cancelCampaign(organizationId, id, {})
				break
			case "pause":
				// Pause campaign (active → paused)
				await ctx.client.organizations.pauseCampaign(organizationId, id, { reason: reason ?? "Paused by user" })
				break
			case "resume":
				// Resume campaign (paused → active)
				await ctx.client.organizations.resumeCampaign(organizationId, id)
				break
			case "end":
				// End campaign (active/paused → ended)
				await ctx.client.organizations.endCampaign(organizationId, id, {})
				break
			case "complete":
				// Complete is same as end for now (no separate completeCampaign method)
				await ctx.client.organizations.endCampaign(organizationId, id, { reason: "Campaign completed" })
				break
			case "archive":
				// Archive campaign (completed/ended → archived)
				await ctx.client.organizations.archiveCampaign(organizationId, id)
				break
			case "unarchive":
				// Unarchive campaign (archived → previous state)
				await ctx.client.organizations.unarchiveCampaign(organizationId, id)
				break
			default:
				throw new Error(`Unknown action: ${action}`)
		}

		revalidateTag("campaigns")
		revalidateTag(`campaign-${id}`)
		return { success: true }
	})

/**
 * Export campaign enrollments
 */
export const exportCampaignEnrollments = authAction
	.inputSchema(z.object({
		organizationId: z.string().min(1),
		campaignId: z.string().min(1)
	}))
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, campaignId } = parsedInput
		return ctx.client.organizations.exportEnrollments(organizationId, campaignId, {})
	})

/**
 * Update campaign pricing
 */
export const updateCampaignPricing = authAction
	.inputSchema(
		z.object({
			organizationId: z.string().min(1),
			campaignId: z.string().min(1),
			rebatePercentage: z.number().min(0).max(100).optional(),
			billRate: z.number().min(0).max(100).optional(),
			platformFee: z.number().min(0).optional(),
			bonusAmount: z.number().min(0).optional(),
		})
	)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, campaignId, ...pricingData } = parsedInput
		const result = await ctx.client.organizations.updateCampaignPricing(organizationId, campaignId, pricingData)
		revalidateTag("campaigns")
		revalidateTag(`campaign-${campaignId}`)
		return result
	})

/**
 * Validate campaign before submission
 */
export const validateCampaign = authAction
	.inputSchema(z.object({
		organizationId: z.string().min(1),
		id: z.string().min(1)
	}))
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, id } = parsedInput
		return ctx.client.organizations.validateCampaign(organizationId, id)
	})

// =============================================================================
// Deliverable Actions - URL-based multi-tenancy
// =============================================================================

/**
 * Add deliverable to campaign
 */
export const addCampaignDeliverable = authAction
	.inputSchema(z.object({
		organizationId: z.string().min(1),
		campaignId: z.string().min(1),
		deliverableId: z.string().min(1),
		quantity: z.number().int().positive().optional(),
		isRequired: z.boolean().optional(),
		instructions: z.string().optional(),
	}))
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, campaignId, deliverableId, quantity, isRequired, instructions } = parsedInput
		const result = await ctx.client.organizations.addCampaignDeliverable(organizationId, {
			campaignId,
			deliverableId,
			quantity,
			isRequired,
			instructions,
		})
		revalidateTag("campaigns")
		revalidateTag(`campaign-${campaignId}`)
		return result
	})

/**
 * Add multiple deliverables to campaign (batch)
 *
 * ✅ FIX Bug 8: Standardized bulk response shape
 */
export const addCampaignDeliverablesBatch = authAction
	.inputSchema(z.object({
		organizationId: z.string().min(1),
		campaignId: z.string().min(1),
		deliverables: z.array(z.object({
			deliverableId: z.string().min(1),
			quantity: z.number().int().positive().optional(),
			payout: z.number().optional(),
		})),
	}))
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, campaignId, deliverables } = parsedInput
		const total = deliverables.length
		const result = await ctx.client.organizations.addCampaignDeliverablesBatch(organizationId, campaignId, { deliverables })
		revalidateTag("campaigns")
		revalidateTag(`campaign-${campaignId}`)

		// Standardized bulk response shape (consistent with products, enrollments)
		const successCount = result.deliverables?.length ?? total
		const failedCount = total - successCount
		return {
			success: failedCount === 0,
			successCount,
			failedCount,
			total,
			isPartialSuccess: failedCount > 0 && successCount > 0,
			errors: [] as string[],
			message: `Added ${successCount} deliverables to campaign`,
			// Keep original data for backwards compatibility
			deliverables: result.deliverables,
		}
	})

/**
 * Update campaign deliverable
 */
export const updateCampaignDeliverable = authAction
	.inputSchema(z.object({
		organizationId: z.string().min(1),
		campaignId: z.string().min(1),
		id: z.string().min(1),
		quantity: z.number().int().positive().optional(),
		isRequired: z.boolean().optional(),
		instructions: z.string().optional(),
	}))
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, campaignId, id, ...data } = parsedInput
		const result = await ctx.client.organizations.updateCampaignDeliverable(organizationId, id, data)
		revalidateTag("campaigns")
		revalidateTag(`campaign-${campaignId}`)
		return result
	})

/**
 * Remove deliverable from campaign
 */
export const removeCampaignDeliverable = authAction
	.inputSchema(z.object({
		organizationId: z.string().min(1),
		campaignId: z.string().min(1),
		id: z.string().min(1),
	}))
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, campaignId, id } = parsedInput
		await ctx.client.organizations.removeCampaignDeliverable(organizationId, id)
		revalidateTag("campaigns")
		revalidateTag(`campaign-${campaignId}`)
		return { success: true }
	})
