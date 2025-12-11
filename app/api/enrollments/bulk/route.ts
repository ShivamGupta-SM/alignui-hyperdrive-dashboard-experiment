import type { NextRequest } from 'next/server'
import { delay, DELAY } from '@/lib/utils/delay'
import { bulkUpdateEnrollmentBodySchema } from '@/lib/validations'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

// PATCH /api/enrollments/bulk - Bulk update enrollment statuses
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await getAuthContext(request)
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.STANDARD)

    const body = await request.json()

    // Validate request body with Zod
    const result = bulkUpdateEnrollmentBodySchema.safeParse(body)

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Invalid request body'
      return errorResponse(firstError, 400, result.error.flatten().fieldErrors)
    }

    const { ids, status } = result.data

    // In a real app, this would batch update in database
    // For now, we simulate the update
    const updatedCount = ids.length

    return successResponse({
      updatedCount,
      message: `Successfully updated ${updatedCount} enrollment(s) to ${status}`,
    })
  } catch (error) {
    console.error('Bulk enrollment update error:', error)
    return serverErrorResponse('Failed to update enrollments')
  }
}
