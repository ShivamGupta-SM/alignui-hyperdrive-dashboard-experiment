import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockEnrollments } from '@/lib/mocks'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const requestChangesSchema = z.object({
  requestedChanges: z.array(z.string()).min(1, 'At least one change request is required'),
  deadline: z.string().optional(), // ISO date string for new deadline
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
    const validationResult = requestChangesSchema.safeParse(body)

    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400)
    }

    const { requestedChanges, deadline, notes } = validationResult.data

    const enrollment = mockEnrollments.find(
      e => e.id === id && e.organizationId === orgId
    )

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    // Can only request changes on enrollments awaiting review
    if (enrollment.status !== 'awaiting_review') {
      return errorResponse('Only enrollments awaiting review can have changes requested', 400)
    }

    await delay(DELAY.MEDIUM)

    return successResponse({
      id,
      status: 'changes_requested',
      message: 'Changes requested from shopper.',
      requestedChanges,
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days
      notes,
      requestedAt: new Date().toISOString(),
      requestedBy: auth.context.userId,
    })
  } catch (error) {
    console.error('Request changes error:', error)
    return serverErrorResponse('Failed to request changes')
  }
}
