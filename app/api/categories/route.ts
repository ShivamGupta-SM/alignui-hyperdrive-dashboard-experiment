import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { mockCategories } from '@/lib/mocks'

export async function GET() {
  try {
    await delay(DELAY.FAST)

    // Return hierarchical categories (with parent-child relationships)
    const categories = mockCategories.filter(c => c.isActive)

    return successResponse(categories)
  } catch (error) {
    console.error('Categories list error:', error)
    return serverErrorResponse('Failed to fetch categories')
  }
}
