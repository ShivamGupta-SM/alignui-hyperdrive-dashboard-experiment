/**
 * Invoices API Mock Handlers
 */

import { http } from 'msw'
import { mockInvoices } from '@/lib/mocks'
import { LIMITS } from '@/lib/types/constants'
import {
  delay,
  DELAY,
  getAuthContext,
  successResponse,
  notFoundResponse,
  paginatedResponse,
  calculatePagination,
  paginateArray,
} from './utils'

function getInvoiceStats(invoices: typeof mockInvoices) {
  return {
    count: invoices.length,
    totalAmount: invoices.reduce((sum, i) => sum + i.totalAmount, 0),
    totalGst: invoices.reduce((sum, i) => sum + i.gstAmount, 0),
    totalEnrollments: invoices.reduce((sum, i) => sum + i.enrollmentCount, 0),
  }
}

export const invoicesHandlers = [
  // GET /api/invoices
  http.get('/api/invoices', async ({ request }) => {
    await delay(DELAY.STANDARD)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)

    const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(url.searchParams.get('limit') || String(LIMITS.DEFAULT_PAGE_SIZE), 10)
    const status = url.searchParams.get('status')

    let invoices = mockInvoices.filter(i => i.organizationId === orgId)

    if (status && status !== 'all') {
      invoices = invoices.filter(i => i.status === status)
    }

    // Sort by date (newest first)
    invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = invoices.length
    const paginatedInvoices = paginateArray(invoices, page, limit)
    const meta = calculatePagination(total, page, limit)

    return paginatedResponse(paginatedInvoices, meta)
  }),

  // GET /api/invoices/data
  http.get('/api/invoices/data', async ({ request }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    const allInvoices = mockInvoices.filter(i => i.organizationId === orgId)

    let filteredInvoices = allInvoices
    if (status && status !== 'all') {
      filteredInvoices = allInvoices.filter(i => i.status === status)
    }

    // Sort by date (newest first)
    filteredInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const stats = getInvoiceStats(allInvoices)

    return successResponse({
      invoices: filteredInvoices,
      allInvoices,
      stats,
    })
  }),

  // GET /api/invoices/:id
  http.get('/api/invoices/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const invoice = mockInvoices.find(
      i => i.id === id && i.organizationId === auth.organizationId
    )

    if (!invoice) {
      return notFoundResponse('Invoice')
    }

    return successResponse(invoice)
  }),

  // GET /api/invoices/:id/pdf
  http.get('/api/invoices/:id/pdf', async ({ params }) => {
    await delay(DELAY.SLOW)

    const auth = getAuthContext()
    const { id } = params

    const invoice = mockInvoices.find(
      i => i.id === id && i.organizationId === auth.organizationId
    )

    if (!invoice) {
      return notFoundResponse('Invoice')
    }

    // In MSW, we'll return a URL that could be used for PDF download
    // The actual PDF generation would happen on the backend
    return successResponse({
      downloadUrl: `/api/invoices/${id}/download`,
      invoice,
    })
  }),

  // POST /api/invoices/:id/pdf - Generate invoice PDF
  http.post('/api/invoices/:id/pdf', async ({ params }) => {
    await delay(DELAY.SLOW)

    const auth = getAuthContext()
    const { id } = params

    const invoice = mockInvoices.find(
      i => i.id === id && i.organizationId === auth.organizationId
    )

    if (!invoice) {
      return notFoundResponse('Invoice')
    }

    return successResponse({
      downloadUrl: `/api/invoices/${id}/download`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
    })
  }),

  // GET /api/invoices/:id/line-items - Get invoice line items
  http.get('/api/invoices/:id/line-items', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const invoice = mockInvoices.find(
      i => i.id === id && i.organizationId === auth.organizationId
    )

    if (!invoice) {
      return notFoundResponse('Invoice')
    }

    // Generate mock line items based on enrollment count
    const lineItems = Array.from({ length: Math.min(invoice.enrollmentCount, 10) }, (_, i) => ({
      id: `line-${id}-${i + 1}`,
      invoiceId: id,
      enrollmentId: `enr-${i + 1}`,
      description: `Enrollment #${i + 1} - Campaign Payout`,
      orderId: `ORD-${100000 + i}`,
      orderValue: Math.round(5000 + Math.random() * 15000),
      billAmount: Math.round(800 + Math.random() * 3000),
      platformFee: 50,
      gstAmount: Math.round(9 + Math.random() * 540),
      totalAmount: Math.round(859 + Math.random() * 3540),
      createdAt: new Date(invoice.createdAt).toISOString(),
    }))

    return successResponse(lineItems)
  }),

  // POST /api/invoices/:id/viewed - Mark invoice as viewed
  http.post('/api/invoices/:id/viewed', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const invoice = mockInvoices.find(
      i => i.id === id && i.organizationId === auth.organizationId
    )

    if (!invoice) {
      return notFoundResponse('Invoice')
    }

    return successResponse({
      id: invoice.id,
      viewedAt: new Date().toISOString(),
    })
  }),
]
