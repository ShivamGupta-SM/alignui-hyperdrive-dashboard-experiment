/**
 * Platforms API Mock Handlers
 */

import { http } from "msw"
import { db } from "@/mocks/db"
import {
	encoreUrl,
	encoreResponse,
	encoreListResponse,
	encoreNotFoundResponse,
	encoreErrorResponse,
} from "./utils"
import { delay, DELAY } from "@/mocks/utils/delay"

export const platformsHandlers = [
	// GET /platforms - List platforms
	http.get(encoreUrl("/platforms"), async () => {
		const platforms = db.platforms.findMany()
		return encoreListResponse(platforms, platforms.length, 0, 50)
	}),

	// GET /platforms/active - Encore client uses this
	http.get(encoreUrl("/platforms/active"), async () => {
		const platforms = db.platforms.findMany()
		return encoreListResponse(platforms, platforms.length, 0, 50)
	}),

	// GET /platforms/all
	http.get(encoreUrl("/platforms/all"), async () => {
		const platforms = db.platforms.findMany()
		return encoreResponse({ platforms })
	}),

	// GET /platforms/:id
	http.get(encoreUrl("/platforms/:id"), async ({ params }) => {
		await delay(DELAY.FAST)
		const { id } = params
		const platform = db.platforms.findFirst((q) => q.where({ id: id }))
		if (!platform) return encoreNotFoundResponse("Platform")
		return encoreResponse(platform)
	}),

	// POST /platforms - Create platform
	http.post(encoreUrl("/platforms"), async ({ request }) => {
		const body = (await request.json()) as {
			name: string
			slug?: string
			description?: string
			logo?: string
		}

		if (!body.name) {
			return encoreErrorResponse("name is required", 400)
		}

		const now = new Date().toISOString()
		const newPlatform = {
			id: `plat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			name: body.name,
			slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
			description: body.description || "",
			logo: body.logo,
			isActive: true,
			createdAt: now,
			updatedAt: now,
		}

		// Save to database
		db.platforms.create(newPlatform)

		return encoreResponse(newPlatform)
	}),

	// PUT /platforms/:id - Update platform
	http.put(encoreUrl("/platforms/:id"), async ({ params, request }) => {
		const { id } = params
		const body = (await request.json()) as {
			name?: string
			slug?: string
			description?: string
			logo?: string
			isActive?: boolean
		}

		const platform = db.platforms.findFirst((q) => q.where({ id: id }))
		if (!platform) {
			return encoreNotFoundResponse("Platform")
		}

		// Update platform in database
		const updated = db.platforms.update({
			where: { id },
			data: {
				...body,
				updatedAt: new Date().toISOString(),
			},
		})

		return encoreResponse(updated)
	}),

	// PATCH /platforms/:id - Partial update platform
	http.patch(encoreUrl("/platforms/:id"), async ({ params, request }) => {
		const { id } = params
		const body = (await request.json()) as Record<string, unknown>

		const platform = db.platforms.findFirst((q) => q.where({ id: id }))
		if (!platform) {
			return encoreNotFoundResponse("Platform")
		}

		// Update platform in database
		const updated = db.platforms.update({
			where: { id },
			data: {
				...body,
				updatedAt: new Date().toISOString(),
			},
		})

		return encoreResponse(updated)
	}),

	// DELETE /platforms/:id - Delete platform
	http.delete(encoreUrl("/platforms/:id"), async ({ params }) => {
		const { id } = params

		const platform = db.platforms.findFirst((q) => q.where({ id: id }))
		if (!platform) {
			return encoreNotFoundResponse("Platform")
		}

		// Check if platform is used in any products or campaigns
		const products = db.products.findMany((q) => q.where({ platform: id }))
		if (products.length > 0) {
			return encoreErrorResponse("Cannot delete platform used in products", 400)
		}

		// Delete platform from database
		db.platforms.delete({ where: { id } })

		return encoreResponse({ deleted: true })
	}),
]

