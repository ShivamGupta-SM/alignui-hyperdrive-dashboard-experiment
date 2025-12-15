/**
 * Campaign Deliverables API Mock Handlers
 *
 * Intercepts Encore API calls for campaign deliverables (deliverables attached to campaigns)
 */

import { http } from "msw"
import { db } from "@/mocks/db"
import {
	getAuthContext,
	encoreUrl,
	encoreResponse,
	encoreListResponse,
	encoreErrorResponse,
	encoreNotFoundResponse,
} from "./utils"
import { delay, DELAY } from "@/mocks/utils/delay"

export const campaignDeliverablesHandlers = [
	// GET /campaigns/:campaignId/deliverables - List deliverables for a campaign
	http.get(encoreUrl("/campaigns/:campaignId/deliverables"), async ({ params, request }) => {
		await delay(DELAY.FAST)

		const auth = getAuthContext()
		const { campaignId } = params
		const url = new URL(request.url)
		const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
		const take = Number.parseInt(url.searchParams.get("take") || "20", 10)

		// Verify campaign exists and belongs to organization
		const campaign = db.campaigns.findFirst((q) =>
			q.where({ id: campaignId as string, organizationId: auth.organizationId })
		)
		if (!campaign) {
			return encoreNotFoundResponse("Campaign")
		}

		// Get campaign deliverables
		const deliverables = db.campaignDeliverables.findMany((q) =>
			q.where({ campaignId: campaignId as string })
		)

		// Sort by sortOrder ascending
		deliverables.sort((a, b) => a.sortOrder - b.sortOrder)

		const total = deliverables.length
		const paginatedDeliverables = deliverables.slice(skip, skip + take)

		return encoreListResponse(paginatedDeliverables, total, skip, take)
	}),

	// GET /campaign-deliverables/:id - Get campaign deliverable by ID
	http.get(encoreUrl("/campaign-deliverables/:id"), async ({ params }) => {
		await delay(DELAY.FAST)

		const auth = getAuthContext()
		const { id } = params
		const deliverableId = Array.isArray(id) ? id[0] : id

		if (!deliverableId) {
			return encoreNotFoundResponse("CampaignDeliverable")
		}

		const deliverable = db.campaignDeliverables.findFirst((q) =>
			q.where({ id: deliverableId as string })
		)

		if (!deliverable) {
			return encoreNotFoundResponse("CampaignDeliverable")
		}

		// Verify campaign belongs to organization
		const campaign = db.campaigns.findFirst((q) =>
			q.where({ id: deliverable.campaignId, organizationId: auth.organizationId })
		)
		if (!campaign) {
			return encoreNotFoundResponse("Campaign")
		}

		return encoreResponse(deliverable)
	}),

	// POST /campaigns/:campaignId/deliverables - Create campaign deliverable
	http.post(encoreUrl("/campaigns/:campaignId/deliverables"), async ({ params, request }) => {
		await delay(DELAY.MEDIUM)

		const auth = getAuthContext()
		const { campaignId } = params
		const body = (await request.json()) as {
			type: string // Deliverable type ID
			title: string
			description?: string
			quantity?: number
			isRequired?: boolean
			instructions?: string
		}

		if (!body.type || !body.title) {
			return encoreErrorResponse("type and title are required", 400)
		}

		// Verify campaign exists and belongs to organization
		const campaign = db.campaigns.findFirst((q) =>
			q.where({ id: campaignId as string, organizationId: auth.organizationId })
		)
		if (!campaign) {
			return encoreNotFoundResponse("Campaign")
		}

		// Verify deliverable type exists
		const deliverableType = db.deliverables.findFirst((q) => q.where({ id: body.type }))
		if (!deliverableType) {
			return encoreNotFoundResponse("Deliverable type")
		}

		const now = new Date().toISOString()
		// Get max sortOrder for this campaign to append new deliverable
		const existingDeliverables = db.campaignDeliverables.findMany((q) =>
			q.where({ campaignId: campaignId as string })
		)
		const maxSortOrder = existingDeliverables.length > 0 
			? Math.max(...existingDeliverables.map(d => d.sortOrder || 0))
			: 0
		
		const newDeliverable = {
			id: `cd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			campaignId: campaignId as string,
			type: body.type as "order_screenshot" | "delivery_photo" | "product_review" | "social_media_post" | "unboxing_video" | "custom",
			title: body.title,
			description: body.description || "",
			quantity: body.quantity || 1,
			isRequired: body.isRequired ?? true,
			instructions: body.instructions || "",
			sortOrder: maxSortOrder + 1,
			createdAt: now,
			updatedAt: now,
		}

		// Save to database
		db.campaignDeliverables.create(newDeliverable)

		return encoreResponse(newDeliverable)
	}),

	// PUT /campaign-deliverables/:id - Update campaign deliverable
	http.put(encoreUrl("/campaign-deliverables/:id"), async ({ params, request }) => {
		await delay(DELAY.MEDIUM)

		const auth = getAuthContext()
		const { id } = params
		const deliverableId = Array.isArray(id) ? id[0] : id

		if (!deliverableId) {
			return encoreNotFoundResponse("CampaignDeliverable")
		}

		const body = (await request.json()) as {
			title?: string
			description?: string
			quantity?: number
			isRequired?: boolean
			instructions?: string
		}

		const deliverable = db.campaignDeliverables.findFirst((q) =>
			q.where({ id: deliverableId as string })
		)

		if (!deliverable) {
			return encoreNotFoundResponse("CampaignDeliverable")
		}

		// Verify campaign belongs to organization
		const campaign = db.campaigns.findFirst((q) =>
			q.where({ id: deliverable.campaignId, organizationId: auth.organizationId })
		)
		if (!campaign) {
			return encoreNotFoundResponse("Campaign")
		}

		// Update deliverable in database - use findFirst + manual update pattern
		const existing = db.campaignDeliverables.findFirst((q) =>
			q.where({ id: deliverableId as string })
		)
		if (!existing) {
			return encoreNotFoundResponse("CampaignDeliverable")
		}
		const updated = { ...existing, ...body }
		db.campaignDeliverables.delete((q) => q.where({ id: deliverableId as string }))
		db.campaignDeliverables.create(updated)

		return encoreResponse(updated)
	}),

	// PATCH /campaign-deliverables/:id - Partial update campaign deliverable
	http.patch(encoreUrl("/campaign-deliverables/:id"), async ({ params, request }) => {
		await delay(DELAY.MEDIUM)

		const auth = getAuthContext()
		const { id } = params
		const deliverableId = Array.isArray(id) ? id[0] : id

		if (!deliverableId) {
			return encoreNotFoundResponse("CampaignDeliverable")
		}

		const body = (await request.json()) as Record<string, unknown>

		const deliverable = db.campaignDeliverables.findFirst((q) =>
			q.where({ id: deliverableId as string })
		)

		if (!deliverable) {
			return encoreNotFoundResponse("CampaignDeliverable")
		}

		// Verify campaign belongs to organization
		const campaign = db.campaigns.findFirst((q) =>
			q.where({ id: deliverable.campaignId, organizationId: auth.organizationId })
		)
		if (!campaign) {
			return encoreNotFoundResponse("Campaign")
		}

		// Update deliverable in database - use findFirst + manual update pattern
		const existing = db.campaignDeliverables.findFirst((q) =>
			q.where({ id: deliverableId as string })
		)
		if (!existing) {
			return encoreNotFoundResponse("CampaignDeliverable")
		}
		const updated = { ...existing, ...body }
		db.campaignDeliverables.delete((q) => q.where({ id: deliverableId as string }))
		db.campaignDeliverables.create(updated)

		return encoreResponse(updated)
	}),

	// DELETE /campaign-deliverables/:id - Delete campaign deliverable
	http.delete(encoreUrl("/campaign-deliverables/:id"), async ({ params }) => {
		await delay(DELAY.MEDIUM)

		const auth = getAuthContext()
		const { id } = params
		const deliverableId = Array.isArray(id) ? id[0] : id

		if (!deliverableId) {
			return encoreNotFoundResponse("CampaignDeliverable")
		}

		const deliverable = db.campaignDeliverables.findFirst((q) =>
			q.where({ id: deliverableId as string })
		)

		if (!deliverable) {
			return encoreNotFoundResponse("CampaignDeliverable")
		}

		// Verify campaign belongs to organization
		const campaign = db.campaigns.findFirst((q) =>
			q.where({ id: deliverable.campaignId, organizationId: auth.organizationId })
		)
		if (!campaign) {
			return encoreNotFoundResponse("Campaign")
		}

		// Check if deliverable has submissions
		const submissions = db.deliverableSubmissions.findMany((q) =>
			q.where({ campaignDeliverableId: deliverableId as string })
		)
		if (submissions.length > 0) {
			return encoreErrorResponse("Cannot delete deliverable with existing submissions", 400)
		}

		// Delete deliverable from database
		db.campaignDeliverables.delete((q) => q.where({ id: deliverableId as string }))

		return encoreResponse({ deleted: true })
	}),
]
