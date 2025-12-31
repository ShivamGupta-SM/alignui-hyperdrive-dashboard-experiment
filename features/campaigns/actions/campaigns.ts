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

// =============================================================================
// Schemas - All actions require organizationId for URL-based multi-tenancy
// =============================================================================

const createCampaignSchema = z.object({
	organizationId: z.string().min(1),
	productId: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional(),
	startDate: z.string(),
	endDate: z.string(),
	maxEnrollments: z.number().int().positive(),
	campaignType: z.enum(["cashback", "barter", "hybrid"]),
	isPublic: z.boolean(),
})

const updateCampaignSchema = z.object({
	organizationId: z.string().min(1),
	id: z.string().min(1),
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

const campaignIdSchema = z.object({
	organizationId: z.string().min(1),
	id: z.string().min(1),
})

const duplicateCampaignSchema = z.object({
	organizationId: z.string().min(1),
	id: z.string().min(1),
	newTitle: z.string().optional(),
})

// Note: CAMPAIGN_STATUS_ACTIONS is defined in types/index.ts as SSOT
// We inline the enum here because "use server" files can only export async functions
// and importing const arrays causes issues with Next.js server actions bundler
const updateStatusSchema = z.object({
	organizationId: z.string().min(1),
	id: z.string().min(1),
	action: z.enum([
		"submit",
		"activate",
		"cancel",
		"pause",
		"resume",
		"end",
		"complete",
		"archive",
		"unarchive",
	]),
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
		const result = await ctx.client.organizations.addCampaignDeliverablesBatch(organizationId, campaignId, { deliverables })
		revalidateTag("campaigns")
		revalidateTag(`campaign-${campaignId}`)
		return result
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
