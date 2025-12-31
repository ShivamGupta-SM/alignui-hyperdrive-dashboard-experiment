/**
 * Products React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 * URL-based multi-tenancy: organizationId from URL params
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/api/client"
import { STALE_TIME, GC_TIME, PAGE_SIZE, DEFAULT_RETRY_CONFIG, createMutationErrorHandler, createQueryKeyFactory } from "@/lib/utils/query-config"
import type { organizations as orgTypes } from "@/brand-client"
import * as actions from "../actions/products"
import type { ProductFilters } from "../types"

// ============================================
// Query Keys - Using factory + custom extensions
// ============================================
const baseKeys = createQueryKeyFactory("products")

export const productKeys = {
	...baseKeys,
	// Extended keys not in base factory
	categories: () => ["product-categories"] as const,
	category: (id: string) => ["product-category", id] as const,
	categoryProducts: (categoryId: string, skip?: number, take?: number) =>
		["product-category", categoryId, "products", skip ?? 0, take ?? 50] as const,
	productCampaigns: (orgId: string, productId: string, skip?: number, take?: number) =>
		["products", orgId, productId, "campaigns", skip ?? 0, take ?? 50] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * List organization products with filters
 */
export function useProducts(orgId: string, filters: ProductFilters = {}) {
	return useQuery({
		queryKey: productKeys.list(orgId, filters),
		queryFn: () =>
			client.organizations.listOrganizationProducts(orgId, {
				skip: filters.skip ?? 0,
				take: filters.take ?? PAGE_SIZE.DEFAULT,
			}),
		enabled: !!orgId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get single product
 */
export function useProduct(orgId: string, id: string) {
	return useQuery({
		queryKey: productKeys.detail(orgId, id),
		queryFn: () => client.organizations.getOrganizationProduct(orgId, id),
		enabled: !!orgId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * List all categories
 */
export function useCategories() {
	return useQuery({
		queryKey: productKeys.categories(),
		queryFn: () => client.products.listAllCategories(),
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get category by ID
 */
export function useCategory(id: string) {
	return useQuery({
		queryKey: productKeys.category(id),
		queryFn: () => client.products.getCategory(id),
		enabled: !!id,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get products in category
 * SSOT: Uses productKeys.categoryProducts for consistent cache keys
 */
export function useCategoryProducts(categoryId: string, params?: { skip?: number; take?: number }) {
	return useQuery({
		queryKey: productKeys.categoryProducts(categoryId, params?.skip, params?.take),
		queryFn: () => client.products.getCategoryProducts(categoryId, params ?? {}),
		enabled: !!categoryId,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * List campaigns for a product
 * SSOT: Uses productKeys.productCampaigns for consistent cache keys
 */
export function useProductCampaigns(orgId: string, productId: string, params?: { skip?: number; take?: number }) {
	return useQuery({
		queryKey: productKeys.productCampaigns(orgId, productId, params?.skip, params?.take),
		queryFn: () => client.organizations.listProductCampaigns(orgId, productId, params ?? {}),
		enabled: !!orgId && !!productId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

// ============================================
// MUTATIONS - Via Server Actions
// ============================================

/**
 * Create product input type
 */
type CreateProductInput = {
	name: string
	sku: string
	price: number
	productLink: string
	description?: string
	categoryId?: string
	platformId?: string
	productImages?: orgTypes.ProductImageInput[]
}

/**
 * Create product
 */
export function useCreateProduct(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: CreateProductInput) => actions.createProduct({
			organizationId: orgId,
			name: data.name,
			sku: data.sku,
			price: data.price,
			productLink: data.productLink,
			description: data.description,
			categoryId: data.categoryId,
			platformId: data.platformId,
			productImages: data.productImages,
		}),
		onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.lists(orgId) }),
		onError: createMutationErrorHandler("create product"),
	})
}

/**
 * Update product
 */
export function useUpdateProduct(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<orgTypes.Product> }) =>
			actions.updateProduct({
				organizationId: orgId,
				id,
				name: data.name,
				description: data.description,
				sku: data.sku,
				categoryId: data.categoryId,
				platformId: data.platformId,
				price: data.price,
				productLink: data.productLink,
				productImages: data.productImages,
			}),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: productKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: productKeys.lists(orgId) })
		},
		onError: createMutationErrorHandler("update product"),
	})
}

/**
 * Delete product
 * Includes optimistic update for instant UI feedback
 */
export function useDeleteProduct(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.deleteProduct({ organizationId: orgId, id }),
		onMutate: async (id) => {
			// Cancel outgoing refetches
			await qc.cancelQueries({ queryKey: productKeys.lists(orgId) })

			// Snapshot previous value for rollback
			const previousLists = qc.getQueriesData({ queryKey: productKeys.lists(orgId) })

			// Optimistically remove from list caches
			qc.setQueriesData({ queryKey: productKeys.lists(orgId) }, (old: unknown) => {
				if (!old || typeof old !== "object" || !("products" in old)) return old
				const data = old as { products: Array<{ id: string }>; total?: number }
				return {
					...data,
					products: data.products.filter((p) => p.id !== id),
					total: (data.total ?? data.products.length) - 1,
				}
			})

			return { previousLists }
		},
		onError: (err, _id, context) => {
			// Rollback on error
			if (context?.previousLists) {
				for (const [key, data] of context.previousLists) {
					qc.setQueryData(key, data)
				}
			}
			createMutationErrorHandler("delete product")(err)
		},
		onSettled: (_, __, id) => {
			// Always refetch after mutation settles
			qc.invalidateQueries({ queryKey: productKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: productKeys.lists(orgId) })
		},
	})
}

/**
 * Bulk import products
 */
export function useBulkImportProducts(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (productsData: orgTypes.BulkProductInput[]) =>
			actions.bulkImportProducts({ organizationId: orgId, products: productsData }),
		onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.lists(orgId) }),
		onError: createMutationErrorHandler("import products"),
	})
}

// Types are exported from @/features/products (feature index)
