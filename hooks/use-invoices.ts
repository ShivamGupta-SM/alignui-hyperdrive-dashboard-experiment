'use client'

import type { invoices, shared } from '@/lib/encore-browser'

// Re-export types from Encore for convenience
export type Invoice = invoices.Invoice
export type InvoiceLineItem = invoices.InvoiceLineItem
export type InvoiceStatus = shared.InvoiceStatus

// ============================================
// Types
// ============================================

export interface InvoiceFilters {
  status?: string
  page?: number
  limit?: number
  [key: string]: string | number | undefined
}
