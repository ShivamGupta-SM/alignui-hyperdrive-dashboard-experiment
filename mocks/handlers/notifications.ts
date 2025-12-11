/**
 * Notifications API Mock Handlers
 */

import { http } from 'msw'
import { mockNotifications } from '@/lib/mocks'
import {
  delay,
  DELAY,
  getAuthContext,
  successResponse,
  notFoundResponse,
  paginatedResponse,
} from './utils'

export const notificationsHandlers = [
  // GET /api/notifications
  http.get('/api/notifications', async ({ request }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)

    const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(url.searchParams.get('limit') || '20', 10)
    const type = url.searchParams.get('type')
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true'

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
      limit,
      total: notifications.length,
      totalPages: Math.ceil(notifications.length / limit),
      hasMore: page < Math.ceil(notifications.length / limit),
    })
  }),

  // GET /api/notifications/unread-count
  http.get('/api/notifications/unread-count', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId

    const unreadCount = mockNotifications.filter(
      n => n.organizationId === orgId && !n.isRead
    ).length

    return successResponse({ count: unreadCount })
  }),

  // POST /api/notifications/:id/read
  http.post('/api/notifications/:id/read', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const notification = mockNotifications.find(
      n => n.id === id && n.organizationId === auth.organizationId
    )

    if (!notification) {
      return notFoundResponse('Notification')
    }

    // Mark as read (in real app, would update DB)
    const updatedNotification = {
      ...notification,
      isRead: true,
    }

    return successResponse(updatedNotification)
  }),

  // POST /api/notifications/mark-all-read
  http.post('/api/notifications/mark-all-read', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId

    const unreadNotifications = mockNotifications.filter(
      n => n.organizationId === orgId && !n.isRead
    )

    return successResponse({
      message: 'All notifications marked as read',
      count: unreadNotifications.length,
    })
  }),
]
