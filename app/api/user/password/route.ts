import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, changePasswordSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { currentPassword, newPassword } = parsed.data

    // In production, verify current password against stored hash
    // For mock, we'll simulate a check
    if (currentPassword === 'wrong') {
      return errorResponse('Current password is incorrect', 400)
    }

    if (currentPassword === newPassword) {
      return errorResponse('New password must be different from current password', 400)
    }

    await delay(DELAY.MEDIUM)

    // In production, hash and store the new password

    return successResponse({
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('Password change error:', error)
    return serverErrorResponse('Failed to change password')
  }
}
