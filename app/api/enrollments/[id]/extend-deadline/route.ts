import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockEnrollments } from '@/lib/mocks'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const extendDeadlineSchema = z.object({
  newDeadline: z.string().min(1, 'New deadline is required'),
  reason: z.string().optional(),
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
    const validationResult = extendDeadlineSchema.safeParse(body)

    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400)
    }

    const { newDeadline, reason } = validationResult.data

    const enrollment = mockEnrollments.find(
      e => e.id === id && e.organizationId === orgId
    )

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    // Validate new deadline is in the future
    const newDate = new Date(newDeadline)
    if (newDate <= new Date()) {
      return errorResponse('New deadline must be in the future', 400)
    }

    await delay(DELAY.FAST)

    return successResponse({
      id,
      submissionDeadline: newDeadline,
      message: 'Deadline extended successfully.',
      reason,
      extendedAt: new Date().toISOString(),
      extendedBy: auth.context.userId,
    })
  } catch (error) {
    console.error('Extend deadline error:', error)
    return serverErrorResponse('Failed to extend deadline')
  }
}
