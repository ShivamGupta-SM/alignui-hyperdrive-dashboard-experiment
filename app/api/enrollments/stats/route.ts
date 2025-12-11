import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockEnrollments } from '@/lib/mocks'

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    // Filter enrollments for this organization
    const orgEnrollments = mockEnrollments.filter(e => e.organizationId === orgId)

    // Calculate stats
    const stats = {
      total: orgEnrollments.length,
      pending: orgEnrollments.filter(e => e.status === 'enrolled' || e.status === 'awaiting_submission').length,
      awaitingReview: orgEnrollments.filter(e => e.status === 'awaiting_review').length,
      approved: orgEnrollments.filter(e => e.status === 'approved').length,
      rejected: orgEnrollments.filter(e => e.status === 'rejected').length,
      expired: orgEnrollments.filter(e => e.status === 'expired').length,
      averageApprovalTime: 2.5, // Mock: 2.5 hours average
      approvalRate: orgEnrollments.length > 0
        ? Math.round((orgEnrollments.filter(e => e.status === 'approved').length / orgEnrollments.length) * 100)
        : 0,
    }

    return successResponse(stats)
  } catch (error) {
    console.error('Enrollment stats error:', error)
    return serverErrorResponse('Failed to fetch enrollment stats')
  }
}
