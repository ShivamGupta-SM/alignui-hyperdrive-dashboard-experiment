/**
 * Categories API Mock Handlers
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

export const categoriesHandlers = [
	// GET /categories - List categories
	http.get(encoreUrl("/categories"), async () => {
		const categories = db.categories.findMany()
		return encoreListResponse(categories, categories.length, 0, 50)
	}),

	// GET /categories/all - All categories
	http.get(encoreUrl("/categories/all"), async () => {
		const categories = db.categories.findMany()
		return encoreResponse({ categories })
	}),

	// GET /categories/:id
	http.get(encoreUrl("/categories/:id"), async ({ params }) => {
		const { id } = params
		const categoryId = Array.isArray(id) ? id[0] : id
		if (!categoryId) {
			return encoreNotFoundResponse("Category")
		}
		const category = db.categories.findFirst((q) => q.where({ id: categoryId as string }))
		if (!category) return encoreNotFoundResponse("Category")
		return encoreResponse(category)
	}),

	// GET /categories/:id/products
	http.get(encoreUrl("/categories/:id/products"), async ({ params, request }) => {
		const { id } = params
		const categoryId = Array.isArray(id) ? id[0] : id
		if (!categoryId) {
			return encoreNotFoundResponse("Category")
		}
		const url = new URL(request.url)
		const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
		const take = Number.parseInt(url.searchParams.get("take") || "20", 10)

		const category = db.categories.findFirst((q) => q.where({ id: categoryId as string }))
		if (!category) return encoreNotFoundResponse("Category")

		const products = db.products.findMany((q) => q.where({ categoryId: category.id }))
		return encoreListResponse(products.slice(skip, skip + take), products.length, skip, take)
	}),

	// POST /categories - Create category
	http.post(encoreUrl("/categories"), async ({ request }) => {
		const body = (await request.json()) as {
			name: string
			description?: string
			icon?: string
		}

		if (!body.name) {
			return encoreErrorResponse("name is required", 400)
		}

		const now = new Date().toISOString()
		const newCategory = {
			id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			name: body.name,
			slug: body.name.toLowerCase().replace(/\s+/g, "-"),
			description: body.description || "",
			icon: body.icon || "📦",
			createdAt: now,
			updatedAt: now,
		}

		// Save to database
		db.categories.create(newCategory)

		return encoreResponse(newCategory)
	}),

	// PUT /categories/:id - Update category
	http.put(encoreUrl("/categories/:id"), async ({ params, request }) => {
		const { id } = params
		const categoryId = Array.isArray(id) ? id[0] : id
		if (!categoryId) {
			return encoreNotFoundResponse("Category")
		}
		const body = (await request.json()) as {
			name?: string
			description?: string
			icon?: string
		}

		const category = db.categories.findFirst((q) => q.where({ id: categoryId as string }))
		if (!category) {
			return encoreNotFoundResponse("Category")
		}

		// Update category in database - use findFirst + manual update pattern
		const updated = { ...category, ...body, updatedAt: new Date().toISOString() }
		db.categories.delete((q) => q.where({ id: categoryId as string }))
		db.categories.create(updated)

		return encoreResponse(updated)
	}),

	// PATCH /categories/:id - Partial update category
	http.patch(encoreUrl("/categories/:id"), async ({ params, request }) => {
		const { id } = params
		const categoryId = Array.isArray(id) ? id[0] : id
		if (!categoryId) {
			return encoreNotFoundResponse("Category")
		}
		const body = (await request.json()) as Record<string, unknown>

		const category = db.categories.findFirst((q) => q.where({ id: categoryId as string }))
		if (!category) {
			return encoreNotFoundResponse("Category")
		}

		// Update category in database - use findFirst + manual update pattern
		const updated = { ...category, ...body, updatedAt: new Date().toISOString() }
		db.categories.delete((q) => q.where({ id: categoryId as string }))
		db.categories.create(updated)

		return encoreResponse(updated)
	}),

	// DELETE /categories/:id - Delete category
	http.delete(encoreUrl("/categories/:id"), async ({ params }) => {
		const { id } = params
		const categoryId = Array.isArray(id) ? id[0] : id
		if (!categoryId) {
			return encoreNotFoundResponse("Category")
		}

		const category = db.categories.findFirst((q) => q.where({ id: categoryId as string }))
		if (!category) {
			return encoreNotFoundResponse("Category")
		}

		// Check if category is used in any products
		const products = db.products.findMany((q) => q.where({ categoryId: categoryId as string }))
		if (products.length > 0) {
			return encoreErrorResponse("Cannot delete category used in products", 400)
		}

		// Delete category from database
		db.categories.delete((q) => q.where({ id: categoryId as string }))

		return encoreResponse({ deleted: true })
	}),
]

