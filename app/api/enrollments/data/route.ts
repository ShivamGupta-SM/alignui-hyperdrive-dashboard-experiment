import { mockEnrollments } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import type { Enrollment } from '@/lib/types'

function getEnrollmentStats(enrollments: Enrollment[]) {
  const now = new Date()
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

  const pending = enrollments.filter(e => e.status === 'awaiting_review')
  const overdue = pending.filter(e => new Date(e.createdAt) < fortyEightHoursAgo)

  return {
    total: enrollments.length,
    pending: pending.length,
    overdue: overdue.length,
    changesRequested: enrollments.filter(e => e.status === 'changes_requested').length,
    approved: enrollments.filter(e => e.status === 'approved').length,
    rejected: enrollments.filter(e => e.status === 'rejected').length,
    totalValue: enrollments.reduce((acc, e) => acc + e.orderValue, 0),
    totalBillAmount: enrollments.reduce((acc, e) => acc + e.billAmount, 0),
  }
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const campaignId = searchParams.get('campaignId')

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    // Get all enrollments for this organization
    let allEnrollments = mockEnrollments.filter(e => e.organizationId === orgId)

    // Filter by campaign if provided
    if (campaignId) {
      allEnrollments = allEnrollments.filter(e => e.campaignId === campaignId)
    }

    // Filter by status if provided
    let filteredEnrollments = allEnrollments
    if (status && status !== 'all') {
      filteredEnrollments = allEnrollments.filter(e => e.status === status)
    }

    // Calculate stats from all enrollments (not filtered by status)
    const stats = getEnrollmentStats(allEnrollments)

    return successResponse({
      enrollments: filteredEnrollments,
      allEnrollments,
      stats,
    })
  } catch (error) {
    console.error('Enrollments data GET error:', error)
    return serverErrorResponse('Failed to fetch enrollments data')
  }
}
