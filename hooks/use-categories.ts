'use client'

import { useQuery } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { products } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'

// Re-export types from Encore for convenience
export type ProductCategory = products.ProductCategory

// ============================================
// Query Keys
// ============================================

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  allList: () => [...categoryKeys.all, 'all'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  byName: (name: string) => [...categoryKeys.all, 'name', name] as const,
  products: (id: string) => [...categoryKeys.all, id, 'products'] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch categories with pagination
 */
export function useCategories(page = 1, limit = 50) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => client.products.listCategories({
      skip: (page - 1) * limit,
      take: limit,
    }),
    staleTime: STALE_TIMES.STATIC, // Categories rarely change
  })
}

/**
 * Fetch all categories (flat list)
 */
export function useAllCategories() {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: categoryKeys.allList(),
    queryFn: async () => {
      const result = await client.products.listAllCategories()
      return result.categories
    },
    staleTime: STALE_TIMES.STATIC,
  })
}

/**
 * Fetch single category by ID
 */
export function useCategory(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => client.products.getCategory(id),
    enabled: !!id,
    staleTime: STALE_TIMES.STATIC,
  })
}

/**
 * Fetch category by name/slug
 */
export function useCategoryByName(name: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: categoryKeys.byName(name),
    queryFn: () => client.products.getCategoryByName(name),
    enabled: !!name,
    staleTime: STALE_TIMES.STATIC,
  })
}

/**
 * Fetch products in a category
 */
export function useCategoryProducts(id: string, page = 1, limit = 20) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...categoryKeys.products(id), { page, limit }],
    queryFn: () => client.products.getCategoryProducts(id, {
      skip: (page - 1) * limit,
      take: limit,
    }),
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
  })
}
