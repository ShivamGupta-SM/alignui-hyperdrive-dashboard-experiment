'use client'

import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiResponse, ApiError, PaginatedResponse, Product } from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'
import type { Category } from '@/lib/mocks'

// Retry configuration - don't retry on 4xx errors
const shouldRetry = (failureCount: number, error: AxiosError<ApiError>) => {
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false
  }
  return failureCount < 3
}

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
 * Fetch active categories (hierarchical)
 */
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => get<ApiResponse<Category[]>>('/api/categories'),
    staleTime: STALE_TIMES.STATIC, // Categories rarely change
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

/**
 * Fetch all categories (flat list, including inactive)
 */
export function useAllCategories() {
  return useQuery({
    queryKey: categoryKeys.allList(),
    queryFn: () => get<ApiResponse<Category[]>>('/api/categories/all'),
    staleTime: STALE_TIMES.STATIC,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

/**
 * Fetch single category by ID
 */
export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => get<ApiResponse<Category>>(`/api/categories/${id}`),
    enabled: !!id,
    staleTime: STALE_TIMES.STATIC,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

/**
 * Fetch category by name/slug
 */
export function useCategoryByName(name: string) {
  return useQuery({
    queryKey: categoryKeys.byName(name),
    queryFn: () => get<ApiResponse<Category>>(`/api/categories/name/${encodeURIComponent(name)}`),
    enabled: !!name,
    staleTime: STALE_TIMES.STATIC,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

/**
 * Fetch products in a category
 */
export function useCategoryProducts(id: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...categoryKeys.products(id), { page, limit }],
    queryFn: () => get<PaginatedResponse<Product>>(`/api/categories/${id}/products`, { params: { page, limit } }),
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
    retry: shouldRetry,
  })
}
