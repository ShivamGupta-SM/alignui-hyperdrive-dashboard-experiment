"use server"

/**
 * Products Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 */

import { revalidateTag } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"
import { getErrorMessage } from "@/lib/utils/format"
import type { products } from "@/lib/api/encore-client"

// =============================================================================
// Schemas
// =============================================================================

const createProductSchema = z.object({
	organizationId: z.string().min(1),
	name: z.string().min(1),
	description: z.string().optional(),
	sku: z.string().min(1),
	categoryId: z.string().optional(),
	platformId: z.string().optional(),
	price: z.number().min(0),
	productLink: z.string().min(1),
	productImages: z.array(z.string()).optional(),
})

const updateProductSchema = z.object({
	id: z.string().min(1),
	name: z.string().optional(),
	description: z.string().optional(),
	sku: z.string().optional(),
	categoryId: z.string().optional(),
	platformId: z.string().optional(),
})

const deleteProductSchema = z.object({
	id: z.string().min(1),
})

const bulkImportSchema = z.object({
	organizationId: z.string().min(1),
	products: z.array(
		z.object({
			name: z.string().optional(),
			description: z.string().optional(),
			sku: z.string().optional(),
			categoryId: z.string().optional(),
			platformId: z.string().optional(),
			price: z.number().optional(),
			productLink: z.string().optional(),
			productImages: z.array(z.string()).optional(),
		})
	),
})

// =============================================================================
// Actions
// =============================================================================

/**
 * Create product
 */
export const createProduct = authAction
	.inputSchema(createProductSchema)
	.action(async ({ parsedInput, ctx }): Promise<products.Product> => {
		const result = await ctx.client.products.createProduct({
			organizationId: parsedInput.organizationId,
			name: parsedInput.name,
			description: parsedInput.description,
			sku: parsedInput.sku,
			categoryId: parsedInput.categoryId,
			platformId: parsedInput.platformId,
			price: parsedInput.price,
			productLink: parsedInput.productLink,
			productImages: parsedInput.productImages,
		})

		revalidateTag("products")
		return result
	})

/**
 * Update product
 */
export const updateProduct = authAction
	.inputSchema(updateProductSchema)
	.action(async ({ parsedInput, ctx }): Promise<products.Product> => {
		const { id, ...data } = parsedInput
		const result = await ctx.client.products.updateProduct(id, {
			name: data.name,
			description: data.description,
			sku: data.sku,
			categoryId: data.categoryId,
			platformId: data.platformId,
		})

		revalidateTag("products")
		revalidateTag(`product-${id}`)
		return result
	})

/**
 * Delete product
 */
export const deleteProduct = authAction
	.inputSchema(deleteProductSchema)
	.action(async ({ parsedInput, ctx }) => {
		await ctx.client.products.deleteProduct(parsedInput.id)
		revalidateTag("products")
		revalidateTag(`product-${parsedInput.id}`)
		return { success: true }
	})

/**
 * Bulk import products
 */
export const bulkImportProducts = authAction
	.inputSchema(bulkImportSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, products: productsData } = parsedInput
		let successCount = 0
		const errors: string[] = []

		try {
			const result = await ctx.client.products.bulkImportProducts({
				organizationId,
				products: productsData.map((p) => ({
					organizationId,
					name: p.name || "",
					description: p.description,
					sku: p.sku || "",
					categoryId: p.categoryId,
					platformId: p.platformId,
					price: p.price || 0,
					productLink: p.productLink || "",
					productImages: p.productImages,
				})),
			})
			successCount = result.imported
			errors.push(...result.errors)
		} catch {
			// Fallback to individual creates
			for (const p of productsData) {
				try {
					await ctx.client.products.createProduct({
						organizationId,
						name: p.name || "",
						description: p.description,
						sku: p.sku || "",
						categoryId: p.categoryId,
						platformId: p.platformId,
						price: p.price || 0,
						productLink: p.productLink || "",
						productImages: p.productImages,
					})
					successCount++
				} catch (e: unknown) {
					errors.push((p.name || "Unknown product") + ": " + getErrorMessage(e, "Unknown error"))
				}
			}
		}

		revalidateTag("products")

		return {
			imported: successCount,
			failed: errors.length,
			errors,
			message:
				errors.length > 0
					? `Imported ${successCount} products. Failed: ${errors.length}`
					: `Imported ${successCount} products`,
		}
	})
