'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { invoices, shared } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'
import { invoiceKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { invoiceKeys }

// Re-export types from Encore for convenience
export type Invoice = invoices.Invoice
export type InvoiceLineItem = invoices.InvoiceLineItem
export type InvoiceStatus = shared.InvoiceStatus

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
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: () => client.invoices.listInvoices({
      skip: filters.page ? (filters.page - 1) * (filters.limit || 20) : 0,
      take: filters.limit || 20,
      status: filters.status as shared.InvoiceStatus | undefined,
    }),
    staleTime: STALE_TIMES.STATIC, // 5 minutes - invoices don't change often
  })
}

export function useInvoice(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => client.invoices.getInvoice(id),
    enabled: !!id,
    staleTime: STALE_TIMES.STATIC,
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
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: invoiceKeys.data(),
    queryFn: async () => {
      const invoicesData = await client.invoices.listInvoices({ take: 50 })

      // Calculate stats from the data
      const stats = {
        count: invoicesData.total,
        totalAmount: invoicesData.data.reduce((sum, inv) => sum + inv.totalAmount, 0),
        totalGst: invoicesData.data.reduce((sum, inv) => sum + inv.gstAmount, 0),
        totalEnrollments: invoicesData.data.reduce((sum, inv) => sum + (inv.enrollmentCount || 0), 0),
      }

      return {
        invoices: invoicesData.data,
        allInvoices: invoicesData.data,
        stats,
      }
    },
    staleTime: STALE_TIMES.STATIC,
  })
}

// ============================================
// Invoice Line Items & PDF Hooks
// ============================================

/**
 * Fetch line items for an invoice
 */
export function useInvoiceLineItems(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...invoiceKeys.detail(id), 'lineItems'] as const,
    queryFn: async () => {
      const result = await client.invoices.getInvoiceLineItems(id)
      return result.lineItems
    },
    enabled: !!id,
    staleTime: STALE_TIMES.STATIC,
  })
}

/**
 * Generate/download invoice PDF
 */
export function useGenerateInvoicePDF(id: string) {
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: async () => {
      const result = await client.invoices.generateInvoicePDF(id)
      return { downloadUrl: result.pdfUrl, expiresAt: new Date(Date.now() + 3600000).toISOString() }
    },
  })
}

/**
 * Mark invoice as viewed
 */
export function useMarkInvoiceViewed(id: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: () => client.invoices.markInvoiceViewed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
    },
  })
}
