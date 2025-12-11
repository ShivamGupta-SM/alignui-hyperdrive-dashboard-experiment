import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockNotifications } from '@/lib/mocks'

export async function POST() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    // Count how many were marked as read
    const unreadCount = mockNotifications.filter(
      n => n.organizationId === orgId && !n.isRead
    ).length

    // In production, this would update the database
    // For mock, we just return success

    return successResponse({
      message: 'All notifications marked as read',
      count: unreadCount,
    })
  } catch (error) {
    console.error('Mark all read error:', error)
    return serverErrorResponse('Failed to mark notifications as read')
  }
}
