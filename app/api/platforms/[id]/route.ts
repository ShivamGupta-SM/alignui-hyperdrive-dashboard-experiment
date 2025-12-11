import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { mockPlatforms } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    await delay(DELAY.FAST)

    const platform = mockPlatforms.find(p => p.id === id)

    if (!platform) {
      return notFoundResponse('Platform')
    }

    return successResponse(platform)
  } catch (error) {
    console.error('Platform get error:', error)
    return serverErrorResponse('Failed to fetch platform')
  }
}
