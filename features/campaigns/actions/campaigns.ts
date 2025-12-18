"use server"

/**
 * Campaign Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 */

import { revalidateTag } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"
import type { campaigns } from "@/lib/api/encore-client"

// =============================================================================
// Schemas
// =============================================================================

const createCampaignSchema = z.object({
	organizationId: z.string().min(1),
	productId: z.string().min(1),
	title: z.string().min(1),
	description: z.string(),
	startDate: z.string(),
	endDate: z.string(),
	maxEnrollments: z.number().int().positive(),
	campaignType: z.enum(["cashback", "barter", "hybrid"]),
	isPublic: z.boolean(),
})

const updateCampaignSchema = z.object({
	id: z.string().min(1),
	data: z.object({
		title: z.string().optional(),
		description: z.string().optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
		maxEnrollments: z.number().int().positive().optional(),
		campaignType: z.enum(["cashback", "barter", "hybrid"]).optional(),
		isPublic: z.boolean().optional(),
	}),
})

const campaignIdSchema = z.object({
	id: z.string().min(1),
})

const duplicateCampaignSchema = z.object({
	id: z.string().min(1),
	organizationId: z.string().min(1),
})

const updateStatusSchema = z.object({
	id: z.string().min(1),
	action: z.enum(["submit", "activate", "cancel", "end", "complete", "archive", "unarchive"]),
})

const pauseCampaignSchema = z.object({
	id: z.string().min(1),
	reason: z.string().default("Paused by user"),
})

// =============================================================================
// Actions
// =============================================================================

/**
 * Create campaign
 */
export const createCampaign = authAction
	.inputSchema(createCampaignSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.campaigns.createCampaign(parsedInput)
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
		const { id, data } = parsedInput
		const result = await ctx.client.campaigns.updateCampaign(id, data)
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
		await ctx.client.campaigns.deleteCampaign(parsedInput.id)
		revalidateTag("campaigns")
		revalidateTag(`campaign-${parsedInput.id}`)
		revalidateTag("dashboard")
		return { success: true }
	})

/**
 * Duplicate campaign
 */
export const duplicateCampaign = authAction
	.inputSchema(duplicateCampaignSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { id, organizationId } = parsedInput
		const original = await ctx.client.campaigns.getCampaign(id)

		const newCampaign = await ctx.client.campaigns.createCampaign({
			organizationId,
			productId: original.productId,
			title: `${original.title} (Copy)`,
			description: original.description || "",
			startDate: original.startDate,
			endDate: original.endDate,
			maxEnrollments: original.maxEnrollments,
			campaignType: original.campaignType,
			isPublic: original.isPublic,
		})

		revalidateTag("campaigns")
		return newCampaign
	})

/**
 * Update campaign status
 */
export const updateCampaignStatus = authAction
	.inputSchema(updateStatusSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { id, action } = parsedInput
		let result

		switch (action) {
			case "submit":
				result = await ctx.client.campaigns.submitForApproval(id)
				break
			case "activate":
				result = await ctx.client.campaigns.activateCampaign(id)
				break
			case "cancel":
				await ctx.client.campaigns.updateCampaignStatus(id, { targetStatus: "cancelled" })
				result = await ctx.client.campaigns.getCampaign(id)
				break
			case "end":
				result = await ctx.client.campaigns.endCampaign(id)
				break
			case "complete":
				await ctx.client.campaigns.updateCampaignStatus(id, { targetStatus: "completed" })
				result = await ctx.client.campaigns.getCampaign(id)
				break
			case "archive":
				result = await ctx.client.campaigns.archiveCampaign(id)
				break
			case "unarchive":
				result = await ctx.client.campaigns.unarchiveCampaign(id)
				break
		}

		revalidateTag("campaigns")
		revalidateTag(`campaign-${id}`)
		return result
	})

/**
 * Pause campaign
 */
export const pauseCampaign = authAction
	.inputSchema(pauseCampaignSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { id, reason } = parsedInput
		await ctx.client.campaigns.pauseCampaign(id, { reason })
		revalidateTag("campaigns")
		revalidateTag(`campaign-${id}`)
		return { success: true }
	})

/**
 * Resume campaign
 */
export const resumeCampaign = authAction
	.inputSchema(campaignIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		await ctx.client.campaigns.resumeCampaign(parsedInput.id)
		revalidateTag("campaigns")
		revalidateTag(`campaign-${parsedInput.id}`)
		return { success: true }
	})

/**
 * End campaign
 */
export const endCampaign = authAction
	.inputSchema(campaignIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		await ctx.client.campaigns.endCampaign(parsedInput.id)
		revalidateTag("campaigns")
		revalidateTag(`campaign-${parsedInput.id}`)
		return { success: true }
	})

/**
 * Export campaign enrollments
 */
export const exportCampaignEnrollments = authAction
	.inputSchema(z.object({ campaignId: z.string().min(1) }))
	.action(async ({ parsedInput, ctx }) => {
		return ctx.client.enrollments.exportEnrollments(parsedInput.campaignId, {})
	})
