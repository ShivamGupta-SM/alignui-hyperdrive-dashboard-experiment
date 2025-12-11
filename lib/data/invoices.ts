// Server-side data fetching for invoices
// This file uses the Encore backend client for type-safe API calls
import 'server-only'

import { getEncoreClient, type invoices as invoicesApi } from '@/lib/encore'
import { mockInvoices } from '@/lib/mocks'
import type { Invoice } from '@/lib/types'

// Feature flag to control whether to use Encore or mock data
const USE_ENCORE = !!process.env.ENCORE_API_URL

export interface GetInvoicesParams {
  period?: 'all' | 'this_month' | 'last_month' | 'last_3_months'
  search?: string
  organizationId?: string
}

/**
 * Convert Encore Invoice to Frontend Invoice type
 * Now uses enrollmentCount and paidAt from the API
 */
function toFrontendInvoice(invoice: invoicesApi.Invoice): Invoice {
  return {
    id: invoice.id,
    organizationId: invoice.organizationId,
    invoiceNumber: invoice.invoiceNumber,
    periodStart: invoice.periodStart ? new Date(invoice.periodStart) : new Date(),
    periodEnd: invoice.periodEnd ? new Date(invoice.periodEnd) : new Date(),
    subtotal: invoice.subtotal,
    gstAmount: invoice.gstAmount,
    totalAmount: invoice.totalAmount,
    status: invoice.status as Invoice['status'],
    dueDate: new Date(invoice.dueDate),
    paidAt: invoice.paidAt ? new Date(invoice.paidAt) : undefined,
    enrollmentCount: invoice.enrollmentCount,
    pdfUrl: invoice.pdfUrl,
    createdAt: new Date(invoice.createdAt),
  }
}

/**
 * Fetch invoices from Encore backend
 */
async function fetchInvoicesFromEncore(organizationId: string): Promise<Invoice[]> {
  const client = getEncoreClient()
  const response = await client.invoices.listInvoices({ organizationId })
  return response.data.map(toFrontendInvoice)
}

export function getInvoices(params?: GetInvoicesParams): Invoice[] {
  let invoices = [...mockInvoices]
  const now = new Date()

  // Filter by period
  if (params?.period && params.period !== 'all') {
    if (params.period === 'this_month') {
      invoices = invoices.filter(i =>
        new Date(i.createdAt).getMonth() === now.getMonth() &&
        new Date(i.createdAt).getFullYear() === now.getFullYear()
      )
    } else if (params.period === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      invoices = invoices.filter(i =>
        new Date(i.createdAt).getMonth() === lastMonth.getMonth() &&
        new Date(i.createdAt).getFullYear() === lastMonth.getFullYear()
      )
    } else if (params.period === 'last_3_months') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      invoices = invoices.filter(i => new Date(i.createdAt) >= threeMonthsAgo)
    }
  }

  // Search by invoice number
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    invoices = invoices.filter(i =>
      i.invoiceNumber.toLowerCase().includes(searchLower)
    )
  }

  return invoices
}

export function getInvoiceById(id: string): Invoice | null {
  return mockInvoices.find(i => i.id === id) || null
}

/**
 * Get invoice by ID from Encore backend
 */
export async function getInvoiceByIdAsync(id: string): Promise<Invoice | null> {
  if (USE_ENCORE) {
    try {
      const client = getEncoreClient()
      const invoice = await client.invoices.getInvoice(id)
      return toFrontendInvoice(invoice)
    } catch (error) {
      console.error('Failed to fetch invoice from Encore:', error)
    }
  }
  return getInvoiceById(id)
}

export function getInvoiceStats(invoices: Invoice[]) {
  return {
    count: invoices.length,
    totalAmount: invoices.reduce((acc, i) => acc + i.totalAmount, 0),
    totalGst: invoices.reduce((acc, i) => acc + i.gstAmount, 0),
    totalEnrollments: invoices.reduce((acc, i) => acc + i.enrollmentCount, 0),
  }
}

// Types for SSR data
export interface InvoiceStats {
  count: number
  totalAmount: number
  totalGst: number
  totalEnrollments: number
}

export interface InvoicesData {
  invoices: Invoice[]
  allInvoices: Invoice[]
  stats: InvoiceStats
}

/**
 * Get all invoices data for SSR hydration
 */
export async function getInvoicesData(organizationId?: string): Promise<InvoicesData> {
  if (USE_ENCORE && organizationId) {
    try {
      const invoices = await fetchInvoicesFromEncore(organizationId)
      const stats = getInvoiceStats(invoices)
      return {
        invoices,
        allInvoices: invoices,
        stats,
      }
    } catch (error) {
      console.error('Failed to fetch invoices from Encore, falling back to mocks:', error)
    }
  }

  // Fallback to mock data
  const invoices = getInvoices()
  const stats = getInvoiceStats(invoices)

  return {
    invoices,
    allInvoices: invoices,
    stats,
  }
}
