import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, errorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockSessions } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params

    // Find the session
    const session = mockSessions.find(s => s.id === id)
    if (!session) {
      return notFoundResponse('Session')
    }

    // Cannot revoke current session
    if (session.isCurrent) {
      return errorResponse('Cannot revoke current session. Use sign out instead.', 400)
    }

    await delay(DELAY.FAST)

    // In production, revoke session using Better Auth

    return successResponse({
      message: 'Session revoked successfully',
      sessionId: id,
    })
  } catch (error) {
    console.error('Session DELETE error:', error)
    return serverErrorResponse('Failed to revoke session')
  }
}
