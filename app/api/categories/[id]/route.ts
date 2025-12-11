import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { mockCategories } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    await delay(DELAY.FAST)

    const category = mockCategories.find(c => c.id === id)

    if (!category) {
      return notFoundResponse('Category')
    }

    return successResponse(category)
  } catch (error) {
    console.error('Category get error:', error)
    return serverErrorResponse('Failed to fetch category')
  }
}
