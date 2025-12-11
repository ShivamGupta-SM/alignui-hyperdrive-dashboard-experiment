import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { mockPlatforms } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ name: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { name } = await params
    const decodedName = decodeURIComponent(name)

    await delay(DELAY.FAST)

    const platform = mockPlatforms.find(
      p => p.name.toLowerCase() === decodedName.toLowerCase() || p.slug === decodedName.toLowerCase()
    )

    if (!platform) {
      return notFoundResponse('Platform')
    }

    return successResponse(platform)
  } catch (error) {
    console.error('Platform get by name error:', error)
    return serverErrorResponse('Failed to fetch platform')
  }
}
