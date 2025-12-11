import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { z } from 'zod'

const uploadUrlSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().min(1, 'Content type is required'),
  folder: z.enum(['avatars', 'logos', 'bills', 'deliverables', 'products']).optional(),
})

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const body = await request.json()
    const validationResult = uploadUrlSchema.safeParse(body)

    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400)
    }

    const { filename, contentType, folder = 'general' } = validationResult.data
    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    // Generate a mock pre-signed upload URL
    // In production, this would generate a real pre-signed URL from S3/GCS/Azure Blob
    const key = `${folder}/${orgId}/${Date.now()}-${filename}`
    const uploadUrl = `https://storage.example.com/upload/${encodeURIComponent(key)}?token=${Date.now()}`

    return successResponse({
      uploadUrl,
      key,
      expiresIn: 3600, // URL expires in 1 hour
    })
  } catch (error) {
    console.error('Upload URL error:', error)
    return serverErrorResponse('Failed to generate upload URL')
  }
}
