import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockUser } from '@/lib/mocks'

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(10, 'Invalid phone number').max(15).optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
})

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.FAST)

    return successResponse({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      phone: mockUser.phone,
      avatar: mockUser.avatar,
      role: mockUser.role,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
      twoFactorEnabled: false,
      emailVerified: true,
    })
  } catch (error) {
    console.error('User GET error:', error)
    return serverErrorResponse('Failed to fetch user profile')
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, updateUserSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const updates = parsed.data

    await delay(DELAY.MEDIUM)

    // In production, update the user in the database
    const updatedUser = {
      ...mockUser,
      ...updates,
      updatedAt: new Date(),
    }

    return successResponse({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    })
  } catch (error) {
    console.error('User PATCH error:', error)
    return serverErrorResponse('Failed to update user profile')
  }
}
