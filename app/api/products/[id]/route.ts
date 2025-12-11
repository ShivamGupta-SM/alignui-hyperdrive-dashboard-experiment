import { z } from 'zod'
import { mockProducts } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody, notFoundResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200).optional(),
  description: z.string().max(1000).optional(),
  image: z.string().url('Invalid image URL').optional(),
  category: z.string().min(1).optional(),
  platform: z.string().min(1).optional(),
  productUrl: z.string().url('Invalid product URL').optional().nullable(),
})

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    const product = mockProducts.find(
      p => p.id === id && p.organizationId === orgId
    )

    if (!product) {
      return notFoundResponse('Product')
    }

    return successResponse(product)
  } catch (error) {
    console.error('Product GET error:', error)
    return serverErrorResponse('Failed to fetch product')
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const parsed = await parseBody(request, updateProductSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const updates = parsed.data

    const product = mockProducts.find(
      p => p.id === id && p.organizationId === orgId
    )

    if (!product) {
      return notFoundResponse('Product')
    }

    await delay(DELAY.FAST)

    // Update product
    const updatedProduct = {
      ...product,
      ...updates,
      updatedAt: new Date(),
    }

    return successResponse(updatedProduct)
  } catch (error) {
    console.error('Product PATCH error:', error)
    return serverErrorResponse('Failed to update product')
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const product = mockProducts.find(
      p => p.id === id && p.organizationId === orgId
    )

    if (!product) {
      return notFoundResponse('Product')
    }

    // Check if product is used in active campaigns
    if (product.campaignCount > 0) {
      return errorResponse(
        'Cannot delete product that is used in campaigns. Archive the campaigns first.',
        400
      )
    }

    await delay(DELAY.FAST)

    return successResponse({
      message: 'Product deleted successfully',
      id,
    })
  } catch (error) {
    console.error('Product DELETE error:', error)
    return serverErrorResponse('Failed to delete product')
  }
}
