/**
 * Deliverables API Mock Handlers - DB Only
 */

import { http } from "msw"
import { db } from "@/mocks/db"
import { encoreUrl, encoreResponse, encoreNotFoundResponse, encoreErrorResponse } from "./utils"

// Static deliverable types
const deliverableTypes = [
	{
		id: "order_screenshot",
		name: "Order Screenshot",
		description: "Screenshot of confirmed order",
		icon: "📸",
	},
	{
		id: "delivery_photo",
		name: "Delivery Photo",
		description: "Photo of delivered product",
		icon: "📦",
	},
	{
		id: "product_review",
		name: "Product Review",
		description: "Written or video review",
		icon: "⭐",
	},
	{
		id: "social_media_post",
		name: "Social Media Post",
		description: "Post on social platform",
		icon: "📱",
	},
	{
		id: "unboxing_video",
		name: "Unboxing Video",
		description: "Video of product unboxing",
		icon: "🎬",
	},
]

export const deliverablesHandlers = [
	// GET /deliverables
	http.get(encoreUrl("/deliverables"), async () => {
		return encoreResponse({ deliverables: deliverableTypes })
	}),

	// GET /deliverables/:id
	http.get(encoreUrl("/deliverables/:id"), async ({ params }) => {
		const { id } = params
		const deliverable = deliverableTypes.find((d) => d.id === id)
		if (!deliverable) return encoreNotFoundResponse("Deliverable")
		return encoreResponse(deliverable)
	}),

	// GET /campaigns/:campaignId/deliverables
	http.get(encoreUrl("/campaigns/:campaignId/deliverables"), async ({ params }) => {
		const { campaignId } = params

		// Get from db
		const deliverables = db.campaignDeliverables.findMany((q) =>
			q.where({ campaignId: campaignId as string })
		)

		if (deliverables.length === 0) {
			// Return default types if none configured
			return encoreResponse({ deliverables: deliverableTypes })
		}

		return encoreResponse({ deliverables })
	}),

	// POST /deliverables - Create deliverable
	http.post(encoreUrl("/deliverables"), async ({ request }) => {
		const body = (await request.json()) as {
			name: string
			description?: string
			platformId?: string
			category: string
			requireLink: boolean
			requireScreenshot: boolean
		}

		if (!body.name || !body.category) {
			return encoreErrorResponse("name and category are required", 400)
		}

		const now = new Date().toISOString()
		const newDeliverable = {
			id: `del-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			name: body.name,
			description: body.description || "",
			platformId: body.platformId,
			category: body.category,
			requireLink: body.requireLink ?? true,
			requireScreenshot: body.requireScreenshot ?? true,
			status: "active" as const,
			metadata: {},
			createdAt: now,
			updatedAt: now,
		}

		// Save to database
		db.deliverables.create(newDeliverable)

		return encoreResponse(newDeliverable)
	}),

	// PUT /deliverables/:id - Update deliverable
	http.put(encoreUrl("/deliverables/:id"), async ({ params, request }) => {
		const { id } = params
		const deliverableId = Array.isArray(id) ? id[0] : id
		if (!deliverableId) {
			return encoreNotFoundResponse("Deliverable")
		}
		const body = (await request.json()) as {
			name?: string
			description?: string
			platformId?: string
			category?: string
			requireLink?: boolean
			requireScreenshot?: boolean
			status?: "active" | "inactive" | "archived"
		}

		const deliverable = db.deliverables.findFirst((q) => q.where({ id: deliverableId as string }))
		if (!deliverable) {
			return encoreNotFoundResponse("Deliverable")
		}

		// Update deliverable in database - use findFirst + manual update pattern
		const updated = { ...deliverable, ...body, updatedAt: new Date().toISOString() }
		db.deliverables.delete((q) => q.where({ id: deliverableId as string }))
		db.deliverables.create(updated)

		return encoreResponse(updated)
	}),

	// PATCH /deliverables/:id - Partial update deliverable
	http.patch(encoreUrl("/deliverables/:id"), async ({ params, request }) => {
		const { id } = params
		const deliverableId = Array.isArray(id) ? id[0] : id
		if (!deliverableId) {
			return encoreNotFoundResponse("Deliverable")
		}
		const body = (await request.json()) as Record<string, unknown>

		const deliverable = db.deliverables.findFirst((q) => q.where({ id: deliverableId as string }))
		if (!deliverable) {
			return encoreNotFoundResponse("Deliverable")
		}

		// Update deliverable in database - use findFirst + manual update pattern
		const updated = { ...deliverable, ...body, updatedAt: new Date().toISOString() }
		db.deliverables.delete((q) => q.where({ id: deliverableId as string }))
		db.deliverables.create(updated)

		return encoreResponse(updated)
	}),

	// DELETE /deliverables/:id - Delete deliverable
	http.delete(encoreUrl("/deliverables/:id"), async ({ params }) => {
		const { id } = params
		const deliverableId = Array.isArray(id) ? id[0] : id
		if (!deliverableId) {
			return encoreNotFoundResponse("Deliverable")
		}

		const deliverable = db.deliverables.findFirst((q) => q.where({ id: deliverableId as string }))
		if (!deliverable) {
			return encoreNotFoundResponse("Deliverable")
		}

		// Check if deliverable is used in any campaign deliverables
		const campaignDeliverables = db.campaignDeliverables.findMany((q) =>
			q.where({ type: deliverableId as "order_screenshot" | "delivery_photo" | "product_review" | "social_media_post" | "unboxing_video" | "custom" })
		)
		if (campaignDeliverables.length > 0) {
			return encoreErrorResponse("Cannot delete deliverable used in campaigns", 400)
		}

		// Delete deliverable from database
		db.deliverables.delete((q) => q.where({ id: deliverableId as string }))

		return encoreResponse({ deleted: true })
	}),
]

