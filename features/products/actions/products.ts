"use server"

/**
 * Products Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 * URL-based multi-tenancy: organizationId from URL params passed to all actions
 */

import { revalidateTag } from "next/cache"
import { z } from "zod"

import { authAction, createOrgSchema, entitySchemas } from "@/lib/safe-action"
import { getErrorMessage } from "@/lib/utils"
import type { organizations as orgTypes } from "@/brand-client"

// =============================================================================
// Schemas - Using createOrgSchema helper for URL-based multi-tenancy
// =============================================================================

const productImageInputSchema = z.object({
	imageUrl: z.string(),
	sortOrder: z.number().optional(),
	altText: z.string().optional(),
	isPrimary: z.boolean().optional(),
})

const createProductSchema = createOrgSchema({
	name: z.string().min(1),
	description: z.string().optional(),
	sku: z.string().min(1),
	categoryId: z.string().optional(),
	platformId: z.string().optional(),
	price: z.number().min(0),
	productLink: z.string().min(1),
	productImages: z.array(productImageInputSchema).optional(),
})

const updateProductSchema = createOrgSchema({
	id: z.string().min(1),
	name: z.string().optional(),
	description: z.string().optional(),
	sku: z.string().optional(),
	categoryId: z.string().optional(),
	platformId: z.string().optional(),
	price: z.number().min(0).optional(),
	productLink: z.string().optional(),
	productImages: z.array(productImageInputSchema).optional(),
})

// Use pre-built schema for simple delete operation
const deleteProductSchema = entitySchemas.byId

const bulkImportSchema = createOrgSchema({
	products: z.array(
		z.object({
			name: z.string().optional(),
			description: z.string().optional(),
			sku: z.string().optional(),
			categoryId: z.string().optional(),
			platformId: z.string().optional(),
			price: z.number().optional(),
			productLink: z.string().optional(),
			productImages: z.array(
				z.object({
					imageUrl: z.string(),
					sortOrder: z.number().optional(),
					altText: z.string().optional(),
					isPrimary: z.boolean().optional(),
				})
			).optional(),
		})
	),
})

// =============================================================================
// Actions - Use organization-scoped endpoints for multi-tenancy
// =============================================================================

/**
 * Create product
 */
export const createProduct = authAction
	.inputSchema(createProductSchema)
	.action(async ({ parsedInput, ctx }): Promise<orgTypes.Product> => {
		const { organizationId, ...productData } = parsedInput
		const result = await ctx.client.organizations.createProduct(organizationId, {
			name: productData.name,
			description: productData.description,
			sku: productData.sku,
			categoryId: productData.categoryId,
			platformId: productData.platformId,
			price: productData.price,
			productLink: productData.productLink,
			productImages: productData.productImages,
		})

		revalidateTag("products")
		return result
	})

/**
 * Update product
 */
export const updateProduct = authAction
	.inputSchema(updateProductSchema)
	.action(async ({ parsedInput, ctx }): Promise<orgTypes.Product> => {
		const { organizationId, id, ...data } = parsedInput
		const result = await ctx.client.organizations.updateProduct(organizationId, id, {
			name: data.name,
			description: data.description,
			sku: data.sku,
			categoryId: data.categoryId,
			platformId: data.platformId,
			price: data.price,
			productLink: data.productLink,
			productImages: data.productImages,
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
		const { organizationId, id } = parsedInput
		await ctx.client.organizations.deleteProduct(organizationId, id)
		revalidateTag("products")
		revalidateTag(`product-${id}`)
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
			const result = await ctx.client.organizations.bulkImportProducts(organizationId, {
				products: productsData.map((p) => ({
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
					await ctx.client.organizations.createProduct(organizationId, {
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
					errors.push(`${p.name || "Unknown product"}: ${getErrorMessage(e, "Unknown error")}`)
				}
			}
		}

		revalidateTag("products")

		// RESTful: Include explicit partial success indicator for client handling
		const totalRequested = productsData.length
		const isPartialSuccess = errors.length > 0 && successCount > 0
		const isFullSuccess = errors.length === 0 && successCount === totalRequested

		return {
			success: isFullSuccess,
			partialSuccess: isPartialSuccess,
			imported: successCount,
			failed: errors.length,
			total: totalRequested,
			errors,
			message:
				errors.length > 0
					? `Imported ${successCount} products. Failed: ${errors.length}`
					: `Imported ${successCount} products`,
		}
	})
