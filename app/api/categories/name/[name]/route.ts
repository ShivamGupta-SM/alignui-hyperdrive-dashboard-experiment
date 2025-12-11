import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { mockCategories } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ name: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { name } = await params
    const decodedName = decodeURIComponent(name)

    await delay(DELAY.FAST)

    const category = mockCategories.find(
      c => c.name.toLowerCase() === decodedName.toLowerCase() || c.slug === decodedName.toLowerCase()
    )

    if (!category) {
      return notFoundResponse('Category')
    }

    return successResponse(category)
  } catch (error) {
    console.error('Category get by name error:', error)
    return serverErrorResponse('Failed to fetch category')
  }
}
