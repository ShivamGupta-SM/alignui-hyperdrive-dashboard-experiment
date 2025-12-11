import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

interface RouteParams {
  params: Promise<{ key: string }>
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { key } = await params
    const decodedKey = decodeURIComponent(key)

    await delay(DELAY.FAST)

    // In production, this would delete the file from S3/GCS/Azure Blob
    // For mock, we just return success

    return successResponse({
      message: 'File deleted successfully',
      key: decodedKey,
    })
  } catch (error) {
    console.error('File delete error:', error)
    return serverErrorResponse('Failed to delete file')
  }
}
