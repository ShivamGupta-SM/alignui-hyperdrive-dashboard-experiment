import type { NextRequest } from 'next/server'
import { mockEnrollments } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { updateEnrollmentBodySchema } from '@/lib/validations'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const auth = await getAuthContext(request)
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.FAST)

    const { id } = await params
    const enrollment = mockEnrollments.find(e => e.id === id)

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    return successResponse(enrollment)
  } catch (error) {
    console.error('Enrollment GET error:', error)
    return serverErrorResponse('Failed to fetch enrollment')
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const auth = await getAuthContext(request)
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.SLOW)

    const { id } = await params
    const enrollment = mockEnrollments.find(e => e.id === id)

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    const body = await request.json()

    // Validate request body with Zod
    const result = updateEnrollmentBodySchema.safeParse(body)

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Invalid request body'
      return errorResponse(firstError, 400, result.error.flatten().fieldErrors)
    }

    const { status, reason } = result.data

    const updatedEnrollment = {
      ...enrollment,
      status,
      updatedAt: new Date(),
      history: [
        ...(enrollment.history || []),
        {
          id: `hist_${Date.now()}`,
          enrollmentId: id,
          action: `Status changed to ${status}`,
          description: reason || `Enrollment ${status}`,
          performedBy: auth.context.user.name,
          performedAt: new Date(),
        },
      ],
    }

    return successResponse(updatedEnrollment)
  } catch (error) {
    console.error('Enrollment PATCH error:', error)
    return serverErrorResponse('Failed to update enrollment')
  }
}
