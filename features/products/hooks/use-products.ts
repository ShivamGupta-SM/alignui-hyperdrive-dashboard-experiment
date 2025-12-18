/**
 * Products React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import { STALE_TIME } from "@/lib/utils/query-config"
import type { products as productTypes } from "@/lib/api/encore-client"
import * as actions from "../actions/products"
import type { ProductFilters } from "../types"

// ============================================
// Client Instance
// ============================================
const client = getEncoreBrowserClient()

// ============================================
// Query Keys
// ============================================
export const productKeys = {
	all: (orgId: string) => ["products", orgId] as const,
	lists: (orgId: string) => [...productKeys.all(orgId), "list"] as const,
	list: (orgId: string, filters?: ProductFilters) => [...productKeys.lists(orgId), filters] as const,
	details: (orgId: string) => [...productKeys.all(orgId), "detail"] as const,
	detail: (orgId: string, id: string) => [...productKeys.details(orgId), id] as const,
	categories: () => ["product-categories"] as const,
	category: (id: string) => ["product-category", id] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * List products with filters
 */
export function useProducts(orgId: string, filters: ProductFilters = {}) {
	return useQuery({
		queryKey: productKeys.list(orgId, filters),
		queryFn: () =>
			client.products.listProducts({
				skip: filters.skip ?? 0,
				take: filters.take ?? 10,
			}),
		enabled: !!orgId,
		staleTime: STALE_TIME.SHORT,
	})
}

/**
 * Get single product
 */
export function useProduct(orgId: string, id: string) {
	return useQuery({
		queryKey: productKeys.detail(orgId, id),
		queryFn: () => client.products.getProduct(id),
		enabled: !!orgId && !!id,
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
	})
}

/**
 * Get category by name
 */
export function useCategoryByName(name: string) {
	return useQuery({
		queryKey: ["category-by-name", name],
		queryFn: () => client.products.getCategoryByName(name),
		enabled: !!name,
		staleTime: STALE_TIME.MEDIUM,
	})
}

/**
 * Get products in category
 */
export function useCategoryProducts(categoryId: string, params?: { skip?: number; take?: number }) {
	return useQuery({
		queryKey: ["category-products", categoryId, params],
		queryFn: () => client.products.getCategoryProducts(categoryId, params ?? {}),
		enabled: !!categoryId,
	})
}

// ============================================
// MUTATIONS - Via Server Actions
// ============================================

/**
 * Create product
 */
export function useCreateProduct(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: Partial<productTypes.Product>) => actions.createProduct({
			organizationId: orgId,
			name: data.name || "",
			sku: data.sku || "",
			price: data.price || 0,
			productLink: data.productLink || "",
			description: data.description,
			categoryId: data.categoryId,
			platformId: data.platformId,
			productImages: data.productImages,
		}),
		onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.lists(orgId) }),
	})
}

/**
 * Update product
 */
export function useUpdateProduct(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<productTypes.Product> }) =>
			actions.updateProduct({ id, name: data.name, description: data.description, sku: data.sku, categoryId: data.categoryId, platformId: data.platformId }),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: productKeys.detail(orgId, id) })
			qc.invalidateQueries({ queryKey: productKeys.lists(orgId) })
		},
	})
}

/**
 * Delete product
 */
export function useDeleteProduct(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: actions.deleteProduct,
		onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.lists(orgId) }),
	})
}

/**
 * Bulk import products
 */
export function useBulkImportProducts(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (productsData: Partial<productTypes.CreateProductRequest>[]) =>
			actions.bulkImportProducts({ organizationId: orgId, products: productsData }),
		onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.lists(orgId) }),
	})
}

// Re-export types
export type * from "../types"
