"use client"

import { useQuery } from "@tanstack/react-query"
import { listProducts, getProductById } from "../lib/api"
import { productsQueryKeys } from "../lib/query-keys"
import type { ProductFilters } from "../types"

/**
 * Hook: Fetch products with filters
 */
export function useProducts(filters: ProductFilters = {}) {
	return useQuery({
		queryKey: productsQueryKeys.list(filters),
		queryFn: () => listProducts({
			skip: ((filters.page || 1) - 1) * (filters.limit || 10),
			take: filters.limit || 10,
		}),
		staleTime: 60 * 1000,
	})
}

/**
 * Hook: Fetch single product
 */
export function useProduct(id: string) {
	return useQuery({
		queryKey: productsQueryKeys.detail(id),
		queryFn: () => getProductById(id),
		enabled: !!id,
	})
}

// Re-export types for convenience
export type * from '../types'
