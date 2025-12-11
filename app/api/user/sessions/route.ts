import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockSessions } from '@/lib/mocks'

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.FAST)

    return successResponse({
      sessions: mockSessions,
      currentSessionId: '1',
    })
  } catch (error) {
    console.error('Sessions GET error:', error)
    return serverErrorResponse('Failed to fetch sessions')
  }
}

export async function DELETE() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.MEDIUM)

    // In production, revoke all sessions except current
    // using Better Auth's revokeOtherSessions

    return successResponse({
      message: 'All other sessions have been revoked',
      revokedCount: mockSessions.filter(s => !s.isCurrent).length,
    })
  } catch (error) {
    console.error('Sessions DELETE error:', error)
    return serverErrorResponse('Failed to revoke sessions')
  }
}
