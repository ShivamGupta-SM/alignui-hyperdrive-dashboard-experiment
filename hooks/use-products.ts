'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { products } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'
import { productKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { productKeys }

// Re-export types from Encore for convenience
export type Product = products.Product
export type ProductWithStats = products.ProductWithStats
// Note: ProductCategory is exported from use-categories.ts

// ============================================
// Types
// ============================================

export interface ProductFilters {
  search?: string
  category?: string
  platform?: string
  page?: number
  limit?: number
  [key: string]: string | number | undefined
}

export interface ProductStats {
  total: number
  withCampaigns: number
  totalCampaigns: number
  categories: number
}

export interface ProductsData {
  products: ProductWithStats[]
  stats: ProductStats
}

interface CreateProductData {
  name: string
  description?: string
  sku: string
  categoryId?: string
  platformId?: string
  price: number
  productLink: string
  productImages?: string[]
}

// ============================================
// Query Hooks
// ============================================

export function useProducts(filters: ProductFilters = {}) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => client.products.listProducts({
      skip: filters.page ? (filters.page - 1) * (filters.limit || 20) : 0,
      take: filters.limit || 20,
      categoryId: filters.category,
      platformId: filters.platform,
      search: filters.search,
    }),
    staleTime: STALE_TIMES.STANDARD,
  })
}

export function useProduct(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => client.products.getProduct(id),
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
  })
}

// ============================================
// Mutation Hooks
// ============================================

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: CreateProductData) => client.products.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: Partial<CreateProductData>) => client.products.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (id: string) => client.products.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

// ============================================
// SSR Hydration Hook
// ============================================

/**
 * Fetch products data for SSR hydration
 * Used by the products page to hydrate React Query cache
 */
export function useProductsData() {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: productKeys.data(),
    queryFn: async () => {
      const [productsData, categoriesData] = await Promise.all([
        client.products.listProducts({ take: 50 }),
        client.products.listAllCategories(),
      ])

      // Calculate stats from the data
      const productsWithCampaigns = productsData.data.filter(p => p.campaignCount > 0)
      const totalCampaigns = productsData.data.reduce((sum, p) => sum + p.campaignCount, 0)

      const stats: ProductStats = {
        total: productsData.total,
        withCampaigns: productsWithCampaigns.length,
        totalCampaigns,
        categories: categoriesData.categories.length,
      }

      return {
        products: productsData.data,
        stats,
      }
    },
    staleTime: STALE_TIMES.STANDARD,
  })
}

// ============================================
// Bulk Import & Campaign List Hooks
// ============================================

export interface BulkImportProduct {
  name: string
  description?: string
  sku: string
  categoryId?: string
  platformId?: string
  price: number
  productLink: string
  productImages?: string[]
}

export interface BulkImportResult {
  imported: number
  failed: number
  errors: string[]
}

/**
 * Bulk import products from CSV/Excel
 */
export function useBulkImportProducts() {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: { products: BulkImportProduct[] }) =>
      client.products.bulkImportProducts({ products: data.products as products.CreateProductRequest[] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export interface ProductCampaignSummary {
  id: string
  title: string
  status: string
  startDate: string
  endDate: string
}

/**
 * Fetch campaigns associated with a product
 */
export function useProductCampaigns(productId: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...productKeys.detail(productId), 'campaigns'] as const,
    queryFn: () => client.products.listProductCampaigns(productId, { take: 50 }),
    enabled: !!productId,
    staleTime: STALE_TIMES.STANDARD,
  })
}
