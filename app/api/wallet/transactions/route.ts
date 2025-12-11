import type { NextRequest } from 'next/server'
import { mockTransactions } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { walletQuerySchema } from '@/lib/validations'
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
    const params = walletQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    )

    if (!params.success) {
      const firstError = params.error.issues[0]?.message || 'Invalid query parameters'
      return errorResponse(firstError, 400, params.error.flatten().fieldErrors)
    }

    const { type, page, limit } = params.data
    const orgId = auth.context.organizationId

    // Filter by organization first
    let transactions = mockTransactions.filter(t => t.organizationId === orgId)

    // Filter by type
    if (type && type !== 'all') {
      transactions = transactions.filter(t => t.type === type)
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Pagination
    const total = transactions.length
    const paginatedTransactions = paginateArray(transactions, page, limit)
    const meta = calculatePagination(total, page, limit)

    return paginatedResponse(paginatedTransactions, meta)
  } catch (error) {
    console.error('Transactions GET error:', error)
    return serverErrorResponse('Failed to fetch transactions')
  }
}
