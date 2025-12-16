/**
 * Products Server Actions
 * 
 * @description
 * Server-side actions for product mutations.
 * Uses Result pattern for consistent error handling.
 */

"use server"

import { revalidatePath } from "next/cache"
import { getEncoreClient, handleAPIError } from "@/lib/api/encore"
import { getOrganizationIdOrNull } from "@/lib/ssr-data"
import type { Result } from "@/shared/lib/errors/types"
import type { products } from "@/lib/api/encore-client"
import type { Product, BulkImportResult } from "../types"

/**
 * Create a new product
 * 
 * @description
 * Creates a new product and invalidates related cache.
 * 
 * @param data - Product creation data
 * @returns Result with created product or error
 */
export async function createProduct(
	data: Partial<products.Product>
): Promise<Result<Product>> {
	const client = getEncoreClient()
	const orgId = await getOrganizationIdOrNull()

	if (!orgId) {
		return { success: false, error: new Error("Organization ID not found") }
	}

	try {
		const createData: products.CreateProductRequest = {
			name: data.name || "",
			description: data.description,
			sku: data.sku || "",
			categoryId: data.categoryId,
			platformId: data.platformId,
			price: (data as products.Product).price || 0,
			productLink: (data as products.Product).productLink || "",
			productImages: (data as products.Product).productImages,
		}
		const result = await client.products.createProduct(createData)
		revalidatePath("/dashboard/products")
		return { success: true, data: result }
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(String(apiError)) }
	}
}

/**
 * Update an existing product
 * 
 * @description
 * Updates a product and invalidates related cache.
 * 
 * @param id - Product ID
 * @param data - Product update data
 * @returns Result indicating success or error
 */
export async function updateProduct(
	id: string,
	data: Partial<products.Product>
): Promise<Result<Product>> {
	const client = getEncoreClient()

	try {
		const updateData: products.UpdateProductRequest = {
			name: data.name,
			description: data.description,
			sku: data.sku,
			categoryId: data.categoryId,
			platformId: data.platformId,
		}
		const result = await client.products.updateProduct(id, updateData)
		revalidatePath("/dashboard/products")
		return { success: true, data: result }
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(String(apiError)) }
	}
}

/**
 * Delete a product
 * 
 * @description
 * Deletes a product and invalidates related cache.
 * 
 * @param id - Product ID
 * @returns Result indicating success or error
 */
export async function deleteProduct(id: string): Promise<Result<void>> {
	const client = getEncoreClient()

	try {
		await client.products.deleteProduct(id)
		revalidatePath("/dashboard/products")
		return { success: true, data: undefined }
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(String(apiError)) }
	}
}

/**
 * Bulk import products
 * 
 * @description
 * Imports multiple products at once.
 * 
 * @param productsData - Array of product data
 * @returns Result with import statistics or error
 */
export async function bulkImportProducts(
	productsData: Partial<products.CreateProductRequest>[]
): Promise<Result<BulkImportResult>> {
	const client = getEncoreClient()
	const orgId = await getOrganizationIdOrNull()

	if (!orgId) {
		return { success: false, error: new Error("Organization ID not found") }
	}

	try {
		let successCount = 0
		const errors: string[] = []

		try {
			const result = await client.products.bulkImportProducts({
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
					const createData: products.CreateProductRequest = {
						name: p.name || "",
						description: p.description,
						sku: p.sku || "",
						categoryId: p.categoryId,
						platformId: p.platformId,
						price: p.price || 0,
						productLink: p.productLink || "",
						productImages: p.productImages,
					}
					await client.products.createProduct(createData)
					successCount++
				} catch (e: unknown) {
					const errorMessage = e instanceof Error ? e.message : "Unknown error"
					errors.push((p.name || "Unknown product") + ": " + errorMessage)
				}
			}
		}

		revalidatePath("/dashboard/products")

		return {
			success: true,
			data: {
				imported: successCount,
				failed: errors.length,
				errors,
				message: errors.length > 0
					? `Imported ${successCount} products. Failed: ${errors.length}`
					: `Imported ${successCount} products`,
				success: errors.length === 0,
			},
		}
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(String(apiError)) }
	}
}
