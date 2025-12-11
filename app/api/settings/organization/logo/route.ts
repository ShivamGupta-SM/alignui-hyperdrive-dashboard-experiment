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
    const file = formData.get('logo') as File | null

    if (!file) {
      return errorResponse('No file provided', 400)
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Allowed: JPEG, PNG, SVG, WebP', 400)
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return errorResponse('File too large. Maximum size is 2MB', 400)
    }

    await delay(DELAY.MEDIUM)

    // In production, upload to cloud storage
    const logoUrl = `https://logo.clearbit.com/${auth.context.organization.slug.replace('@', '')}.com`

    return successResponse({
      logoUrl,
      message: 'Logo uploaded successfully',
    })
  } catch (error) {
    console.error('Logo upload error:', error)
    return serverErrorResponse('Failed to upload logo')
  }
}

export async function DELETE() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.FAST)

    return successResponse({
      message: 'Logo removed successfully',
    })
  } catch (error) {
    console.error('Logo delete error:', error)
    return serverErrorResponse('Failed to remove logo')
  }
}
