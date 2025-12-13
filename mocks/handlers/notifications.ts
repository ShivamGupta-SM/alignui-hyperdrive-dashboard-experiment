/**
 * Notifications API Mock Handlers
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import { getAuthContext, encoreUrl, encoreResponse, encoreListResponse, encoreNotFoundResponse } from './utils'

export const notificationsHandlers = [
  // GET /notifications
  http.get(encoreUrl('/notifications'), async ({ request }) => {
    const url = new URL(request.url)
    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)

    const auth = getAuthContext()
    const notifications = db.notifications.findMany((q) => q.where({ organizationId: auth.organizationId || '1' }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return encoreListResponse(
      notifications.slice(skip, skip + take).map(n => ({
        ...n,
        createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt, // Already ISO string from db
      })),
      notifications.length,
      skip,
      take
    )
  }),

  // GET /notifications/unread-count
  http.get(encoreUrl('/notifications/unread-count'), async () => {
    const auth = getAuthContext()
    const notifications = db.notifications.findMany((q) => q.where({ organizationId: auth.organizationId || '1' }))
    const unreadCount = notifications.filter(n => !n.isRead).length
    return encoreResponse({ count: unreadCount })
  }),

  // POST /notifications/:id/read
  http.post(encoreUrl('/notifications/:id/read'), async ({ params }) => {
    await delay(DELAY.FAST)
    const { id } = params
    const auth = getAuthContext()
    const notification = db.notifications.findFirst((q) => q.where({ id, organizationId: auth.organizationId || '1' }))
    if (!notification) return encoreNotFoundResponse('Notification')
    return encoreResponse({ ...notification, isRead: true })
  }),

  // POST /notifications/read-all
  http.post(encoreUrl('/notifications/read-all'), async () => {
    return encoreResponse({ success: true })
  }),
]
