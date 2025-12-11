import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { z } from 'zod'

const downloadUrlSchema = z.object({
  key: z.string().min(1, 'File key is required'),
})

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const body = await request.json()
    const validationResult = downloadUrlSchema.safeParse(body)

    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400)
    }

    const { key } = validationResult.data

    await delay(DELAY.FAST)

    // Generate a mock pre-signed download URL
    // In production, this would generate a real pre-signed URL from S3/GCS/Azure Blob
    const downloadUrl = `https://storage.example.com/download/${encodeURIComponent(key)}?token=${Date.now()}`

    return successResponse({
      downloadUrl,
      expiresIn: 3600, // URL expires in 1 hour
    })
  } catch (error) {
    console.error('Download URL error:', error)
    return serverErrorResponse('Failed to generate download URL')
  }
}
