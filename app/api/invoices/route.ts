import type { NextRequest } from 'next/server'
import { mockInvoices } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { invoiceQuerySchema } from '@/lib/validations'
import {
  paginatedResponse,
  errorResponse,
  serverErrorResponse,
  calculatePagination,
  paginateArray,
} from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await getAuthContext(request)
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.STANDARD)

    const { searchParams } = new URL(request.url)

    // Validate query parameters with Zod
    const params = invoiceQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    )

    if (!params.success) {
      const firstError = params.error.issues[0]?.message || 'Invalid query parameters'
      return errorResponse(firstError, 400, params.error.flatten().fieldErrors)
    }

    const { status, page, limit } = params.data
    const orgId = auth.context.organizationId

    // Filter by organization first
    let invoices = mockInvoices.filter(i => i.organizationId === orgId)

    // Filter by status
    if (status && status !== 'all') {
      invoices = invoices.filter(i => i.status === status)
    }

    // Sort by date (newest first)
    invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Pagination
    const total = invoices.length
    const paginatedInvoices = paginateArray(invoices, page, limit)
    const meta = calculatePagination(total, page, limit)

    return paginatedResponse(paginatedInvoices, meta)
  } catch (error) {
    console.error('Invoices GET error:', error)
    return serverErrorResponse('Failed to fetch invoices')
  }
}
