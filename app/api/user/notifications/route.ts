import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
  enrollmentAlerts: z.boolean().optional(),
  campaignUpdates: z.boolean().optional(),
  walletAlerts: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
})

// Mock notification settings
const mockNotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  soundEnabled: true,
  enrollmentAlerts: true,
  campaignUpdates: true,
  walletAlerts: true,
  marketingEmails: false,
  weeklyDigest: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
}

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.FAST)

    return successResponse(mockNotificationSettings)
  } catch (error) {
    console.error('Notifications GET error:', error)
    return serverErrorResponse('Failed to fetch notification settings')
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, notificationSettingsSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const updates = parsed.data

    await delay(DELAY.FAST)

    // In production, update in database
    const updatedSettings = {
      ...mockNotificationSettings,
      ...updates,
    }

    return successResponse(updatedSettings)
  } catch (error) {
    console.error('Notifications PATCH error:', error)
    return serverErrorResponse('Failed to update notification settings')
  }
}
