import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockNotifications } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    const notification = mockNotifications.find(
      n => n.id === id && n.organizationId === orgId
    )

    if (!notification) {
      return notFoundResponse('Notification')
    }

    // In production, this would update the database
    // For mock, we just return the notification as read

    return successResponse({
      ...notification,
      isRead: true,
    })
  } catch (error) {
    console.error('Mark notification read error:', error)
    return serverErrorResponse('Failed to mark notification as read')
  }
}
