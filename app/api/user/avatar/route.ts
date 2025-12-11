import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File | null

    if (!file) {
      return errorResponse('No file provided', 400)
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Allowed: JPEG, PNG, GIF, WebP', 400)
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return errorResponse('File too large. Maximum size is 5MB', 400)
    }

    await delay(DELAY.MEDIUM)

    // In production, upload to cloud storage (S3, Cloudflare R2, etc.)
    // and return the actual URL
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`

    return successResponse({
      avatarUrl,
      message: 'Avatar uploaded successfully',
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return serverErrorResponse('Failed to upload avatar')
  }
}

export async function DELETE() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.FAST)

    // In production, delete from cloud storage and update user record

    return successResponse({
      message: 'Avatar removed successfully',
    })
  } catch (error) {
    console.error('Avatar delete error:', error)
    return serverErrorResponse('Failed to remove avatar')
  }
}
