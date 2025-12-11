'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { Invoice, InvoiceLineItem, ApiResponse, PaginatedResponse, ApiError } from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'
import { invoiceKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { invoiceKeys }

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

interface InvoiceFilters {
  status?: string
  page?: number
  limit?: number
  [key: string]: string | number | undefined
}

// ============================================
// Query Hooks
// ============================================

export function useInvoices(filters: InvoiceFilters = {}) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: () => get<PaginatedResponse<Invoice>>('/api/invoices', { params: filters }),
    staleTime: STALE_TIMES.STATIC, // 5 minutes - invoices don't change often
    retry: shouldRetry,
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => get<ApiResponse<Invoice>>(`/api/invoices/${id}`),
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

// ============================================
// SSR Hydration Hook
// ============================================

/**
 * Fetch invoices data for SSR hydration
 * Used by the invoices page to hydrate React Query cache
 */
export function useInvoicesData() {
  return useQuery({
    queryKey: invoiceKeys.data(),
    queryFn: async () => {
      const response = await get<ApiResponse<{
        invoices: Invoice[]
        allInvoices: Invoice[]
        stats: {
          count: number
          totalAmount: number
          totalGst: number
          totalEnrollments: number
        }
      }>>('/api/invoices/data')
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
    staleTime: STALE_TIMES.STATIC,
    retry: shouldRetry,
  })
}

// ============================================
// Invoice Line Items & PDF Hooks
// ============================================

/**
 * Fetch line items for an invoice
 */
export function useInvoiceLineItems(id: string) {
  return useQuery({
    queryKey: [...invoiceKeys.detail(id), 'lineItems'] as const,
    queryFn: () => get<ApiResponse<InvoiceLineItem[]>>(`/api/invoices/${id}/line-items`),
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
 * Generate/download invoice PDF
 */
export function useGenerateInvoicePDF(id: string) {
  return useMutation({
    mutationFn: () =>
      post<ApiResponse<{ downloadUrl: string; expiresAt: string }>>(`/api/invoices/${id}/pdf`, {}),
  })
}

/**
 * Mark invoice as viewed
 */
export function useMarkInvoiceViewed(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      post<ApiResponse<{ id: string; viewedAt: string }>>(`/api/invoices/${id}/viewed`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
    },
  })
}
