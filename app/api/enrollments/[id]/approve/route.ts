import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockEnrollments } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const enrollment = mockEnrollments.find(
      e => e.id === id && e.organizationId === orgId
    )

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    // Can only approve enrollments awaiting review
    if (enrollment.status !== 'awaiting_review') {
      return errorResponse('Only enrollments awaiting review can be approved', 400)
    }

    await delay(DELAY.MEDIUM)

    return successResponse({
      id,
      status: 'approved',
      message: 'Enrollment approved successfully. Hold will be committed.',
      approvedAt: new Date().toISOString(),
      approvedBy: auth.context.userId,
    })
  } catch (error) {
    console.error('Enrollment approve error:', error)
    return serverErrorResponse('Failed to approve enrollment')
  }
}
