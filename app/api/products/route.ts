import { z } from 'zod'
import { mockProducts } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody, paginatedResponse, calculatePagination, paginateArray } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  description: z.string().max(1000).optional(),
  image: z.string().url('Invalid image URL').optional(),
  category: z.string().min(1, 'Category is required'),
  platform: z.string().min(1, 'Platform is required'),
  productUrl: z.string().url('Invalid product URL').optional(),
})

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const category = searchParams.get('category')
    const platform = searchParams.get('platform')
    const search = searchParams.get('search')

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    // Get products for this organization
    let products = mockProducts.filter(p => p.organizationId === orgId)

    // Filter by category
    if (category) {
      products = products.filter(p => p.category === category)
    }

    // Filter by platform
    if (platform) {
      products = products.filter(p => p.platform === platform)
    }

    // Search by name
    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by most recently updated
    products.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const total = products.length
    const paginatedProducts = paginateArray(products, page, limit)
    const meta = calculatePagination(total, page, limit)

    return paginatedResponse(paginatedProducts, meta)
  } catch (error) {
    console.error('Products GET error:', error)
    return serverErrorResponse('Failed to fetch products')
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, createProductSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const productData = parsed.data
    const orgId = auth.context.organizationId

    await delay(DELAY.MEDIUM)

    // Create new product
    const newProduct = {
      id: `product-${Date.now()}`,
      organizationId: orgId,
      ...productData,
      campaignCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return successResponse(newProduct, 201)
  } catch (error) {
    console.error('Product POST error:', error)
    return serverErrorResponse('Failed to create product')
  }
}
