import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse, paginatedResponse } from '@/lib/api-utils'
import { mockCategories, mockProducts } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    await delay(DELAY.FAST)

    const category = mockCategories.find(c => c.id === id)

    if (!category) {
      return notFoundResponse('Category')
    }

    // Filter products by category name (since products store category as string)
    const products = mockProducts.filter(p => p.category === category.name)

    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = products.slice(startIndex, endIndex)

    return paginatedResponse(paginatedProducts, {
      page,
      pageSize: limit,
      total: products.length,
      totalPages: Math.ceil(products.length / limit),
    })
  } catch (error) {
    console.error('Category products error:', error)
    return serverErrorResponse('Failed to fetch category products')
  }
}
