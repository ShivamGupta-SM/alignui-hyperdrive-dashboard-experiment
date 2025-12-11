import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { mockPlatforms } from '@/lib/mocks'

export async function GET() {
  try {
    await delay(DELAY.FAST)

    // Return all platforms
    return successResponse(mockPlatforms)
  } catch (error) {
    console.error('Platforms list error:', error)
    return serverErrorResponse('Failed to fetch platforms')
  }
}
