import type { NextRequest } from 'next/server'
import { mockEnrollments } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { enrollmentQuerySchema } from '@/lib/validations'
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
    const params = enrollmentQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    )

    if (!params.success) {
      const firstError = params.error.issues[0]?.message || 'Invalid query parameters'
      return errorResponse(firstError, 400, params.error.flatten().fieldErrors)
    }

    const { status, campaignId, search, page, limit } = params.data
    const orgId = auth.context.organizationId

    // Filter by organization first
    let enrollments = mockEnrollments.filter(e => e.organizationId === orgId)

    // Filter by status
    if (status && status !== 'all') {
      enrollments = enrollments.filter(e => e.status === status)
    }

    // Filter by campaign
    if (campaignId) {
      enrollments = enrollments.filter(e => e.campaignId === campaignId)
    }

    // Search by order ID or shopper name
    if (search) {
      enrollments = enrollments.filter(e =>
        e.orderId.toLowerCase().includes(search.toLowerCase()) ||
        e.shopper?.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Pagination
    const total = enrollments.length
    const paginatedEnrollments = paginateArray(enrollments, page, limit)
    const meta = calculatePagination(total, page, limit)

    return paginatedResponse(paginatedEnrollments, meta)
  } catch (error) {
    console.error('Enrollments GET error:', error)
    return serverErrorResponse('Failed to fetch enrollments')
  }
}
