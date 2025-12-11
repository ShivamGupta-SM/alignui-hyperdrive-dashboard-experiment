import { delay, DELAY } from '@/lib/utils/delay'
import { serverErrorResponse, paginatedResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockNotifications } from '@/lib/mocks'

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    // Filter notifications for the organization
    let notifications = mockNotifications.filter(n => n.organizationId === orgId)

    // Filter by type if specified
    if (type) {
      notifications = notifications.filter(n => n.type === type)
    }

    // Filter by unread only if specified
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.isRead)
    }

    // Sort by createdAt descending (most recent first)
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedNotifications = notifications.slice(startIndex, endIndex)

    return paginatedResponse(paginatedNotifications, {
      page,
      pageSize: limit,
      total: notifications.length,
      totalPages: Math.ceil(notifications.length / limit),
    })
  } catch (error) {
    console.error('Notifications list error:', error)
    return serverErrorResponse('Failed to fetch notifications')
  }
}
