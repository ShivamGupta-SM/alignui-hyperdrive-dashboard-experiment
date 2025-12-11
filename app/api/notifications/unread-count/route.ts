import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockNotifications } from '@/lib/mocks'

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    // Count unread notifications for the organization
    const unreadCount = mockNotifications.filter(
      n => n.organizationId === orgId && !n.isRead
    ).length

    return successResponse({ count: unreadCount })
  } catch (error) {
    console.error('Unread count error:', error)
    return serverErrorResponse('Failed to fetch unread count')
  }
}
