import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { mockPlatforms } from '@/lib/mocks'

export async function GET() {
  try {
    await delay(DELAY.FAST)

    // Return only active platforms
    const activePlatforms = mockPlatforms.filter(p => p.isActive)

    return successResponse(activePlatforms)
  } catch (error) {
    console.error('Active platforms list error:', error)
    return serverErrorResponse('Failed to fetch active platforms')
  }
}
