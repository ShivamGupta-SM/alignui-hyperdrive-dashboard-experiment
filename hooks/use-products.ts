'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, patch, del } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { Product, ApiResponse, ApiError } from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'
import { productKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { productKeys }

// Retry configuration - don't retry on 4xx errors
const shouldRetry = (failureCount: number, error: AxiosError<ApiError>) => {
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false
  }
  return failureCount < 3
}

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
  products: Product[]
  stats: ProductStats
}

interface CreateProductData {
  name: string
  description?: string
  image?: string
  category: string
  platform: string
  productUrl?: string
}

// ============================================
// Query Hooks
// ============================================

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => get<ApiResponse<Product[]>>('/api/products', { params: filters }),
    staleTime: STALE_TIMES.STANDARD,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => get<ApiResponse<Product>>(`/api/products/${id}`),
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

// ============================================
// Mutation Hooks
// ============================================

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProductData) =>
      post<ApiResponse<Product>>('/api/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<CreateProductData>) =>
      patch<ApiResponse<Product>>(`/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      del<ApiResponse<void>>(`/api/products/${id}`),
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
  return useQuery({
    queryKey: productKeys.data(),
    queryFn: async () => {
      const response = await get<ApiResponse<ProductsData>>('/api/products/data')
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
    staleTime: STALE_TIMES.STANDARD,
    retry: shouldRetry,
  })
}

// ============================================
// Bulk Import & Campaign List Hooks
// ============================================

export interface BulkImportProduct {
  name: string
  description?: string
  category: string
  platform: string
  productUrl?: string
  price?: number
  sku?: string
}

export interface BulkImportResult {
  totalProcessed: number
  successCount: number
  failedCount: number
  errors: { row: number; error: string }[]
  products: Product[]
}

/**
 * Bulk import products from CSV/Excel
 */
export function useBulkImportProducts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { products: BulkImportProduct[] } | FormData) =>
      post<ApiResponse<BulkImportResult>>('/api/products/bulk-import', data),
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
  currentEnrollments: number
  maxEnrollments: number
  totalPayout: number
}

/**
 * Fetch campaigns associated with a product
 */
export function useProductCampaigns(productId: string) {
  return useQuery({
    queryKey: [...productKeys.detail(productId), 'campaigns'] as const,
    queryFn: () => get<ApiResponse<ProductCampaignSummary[]>>(`/api/products/${productId}/campaigns`),
    enabled: !!productId,
    staleTime: STALE_TIMES.STANDARD,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}
