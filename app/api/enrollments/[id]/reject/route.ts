import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockEnrollments } from '@/lib/mocks'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const rejectSchema = z.object({
  reasons: z.array(z.string()).min(1, 'At least one reason is required'),
  notes: z.string().optional(),
})

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const body = await request.json()
    const validationResult = rejectSchema.safeParse(body)

    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400)
    }

    const { reasons, notes } = validationResult.data

    const enrollment = mockEnrollments.find(
      e => e.id === id && e.organizationId === orgId
    )

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    // Can only reject enrollments awaiting review
    if (enrollment.status !== 'awaiting_review') {
      return errorResponse('Only enrollments awaiting review can be rejected', 400)
    }

    await delay(DELAY.MEDIUM)

    return successResponse({
      id,
      status: 'rejected',
      message: 'Enrollment rejected. Hold will be voided.',
      reasons,
      notes,
      rejectedAt: new Date().toISOString(),
      rejectedBy: auth.context.userId,
    })
  } catch (error) {
    console.error('Enrollment reject error:', error)
    return serverErrorResponse('Failed to reject enrollment')
  }
}
