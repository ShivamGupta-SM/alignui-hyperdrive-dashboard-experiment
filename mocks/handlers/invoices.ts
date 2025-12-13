/**
 * Invoices API Mock Handlers
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import { getAuthContext, encoreUrl, encoreResponse, encoreListResponse, encoreNotFoundResponse } from './utils'
import { delay, DELAY } from '@/mocks/utils/delay'

export const invoicesHandlers = [
  // GET /invoices
  http.get(encoreUrl('/invoices'), async ({ request }) => {
    const auth = getAuthContext()
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)
    const status = url.searchParams.get('status')

    let invoices = db.invoices.findMany((q) => q.where({ organizationId: auth.organizationId || '1' }))

    if (status && status !== 'all') {
      invoices = invoices.filter(i => i.status === status)
    }

    invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return encoreListResponse(
      invoices.slice(skip, skip + take).map(i => ({
        id: i.id,
        organizationId: i.organizationId,
        invoiceNumber: i.invoiceNumber,
        issuedAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
        dueDate: i.dueDate instanceof Date ? i.dueDate.toISOString() : i.dueDate,
        periodStart: undefined,
        periodEnd: undefined,
        subtotal: i.totalAmount * 0.9,
        gstAmount: i.totalAmount * 0.1,
        gstPercent: 10,
        tdsPercentage: 0,
        tdsAmount: 0,
        totalAmount: i.totalAmount,
        amountPaid: i.paidAmount || 0,
        status: i.status as 'pending' | 'paid' | 'overdue' | 'cancelled',
        pdfUrl: undefined,
        notes: undefined,
        createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
      })),
      invoices.length,
      skip,
      take
    )
  }),

  // GET /invoices/:id
  http.get(encoreUrl('/invoices/:id'), async ({ params }) => {
    const auth = getAuthContext()
    const { id } = params

    const invoice = db.invoices.findFirst((q) => q.where({ id, organizationId: auth.organizationId || '1' }))
    if (!invoice) return encoreNotFoundResponse('Invoice')

    return encoreResponse({
      id: invoice.id,
      organizationId: invoice.organizationId,
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.createdAt instanceof Date ? invoice.createdAt.toISOString() : invoice.createdAt,
      dueDate: invoice.dueDate instanceof Date ? invoice.dueDate.toISOString() : invoice.dueDate,
      periodStart: undefined,
      periodEnd: undefined,
      subtotal: invoice.totalAmount * 0.9,
      gstAmount: invoice.totalAmount * 0.1,
      gstPercent: 10,
      tdsPercentage: 0,
      tdsAmount: 0,
      totalAmount: invoice.totalAmount,
      amountPaid: invoice.paidAmount || 0,
      status: invoice.status as 'pending' | 'paid' | 'overdue' | 'cancelled',
      pdfUrl: undefined,
      notes: undefined,
      createdAt: invoice.createdAt instanceof Date ? invoice.createdAt.toISOString() : invoice.createdAt,
    })
  }),

  // GET /organizations/:orgId/invoices
  http.get(encoreUrl('/organizations/:orgId/invoices'), async ({ params, request }) => {
    await delay(DELAY.STANDARD)

    const { orgId } = params as { orgId: string }
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)

    const invoices = db.invoices.findMany((q) => q.where({ organizationId: orgId || '1' }))

    return encoreListResponse(
      invoices.slice(skip, skip + take).map(i => ({
        id: i.id,
        organizationId: i.organizationId,
        invoiceNumber: i.invoiceNumber,
        issuedAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
        dueDate: i.dueDate instanceof Date ? i.dueDate.toISOString() : i.dueDate,
        periodStart: undefined,
        periodEnd: undefined,
        subtotal: i.totalAmount * 0.9,
        gstAmount: i.totalAmount * 0.1,
        gstPercent: 10,
        tdsPercentage: 0,
        tdsAmount: 0,
        totalAmount: i.totalAmount,
        amountPaid: i.paidAmount || 0,
        status: i.status as 'pending' | 'paid' | 'overdue' | 'cancelled',
        pdfUrl: undefined,
        notes: undefined,
        createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
      })),
      invoices.length,
      skip,
      take
    )
  }),
]
