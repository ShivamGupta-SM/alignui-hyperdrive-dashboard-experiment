import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { mockCategories } from '@/lib/mocks'

export async function GET() {
  try {
    await delay(DELAY.FAST)

    // Return flat list of all categories (including inactive)
    return successResponse(mockCategories)
  } catch (error) {
    console.error('Categories all list error:', error)
    return serverErrorResponse('Failed to fetch all categories')
  }
}
