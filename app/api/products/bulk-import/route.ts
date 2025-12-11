import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockCategories, mockPlatforms } from '@/lib/mocks'

interface BulkImportProduct {
  name: string
  description?: string
  category: string
  platform: string
  productUrl?: string
  price?: number
  sku?: string
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const orgId = auth.context.organizationId
    const body = await request.json()

    const { products: importProducts } = body as { products?: BulkImportProduct[] }

    if (!importProducts || !Array.isArray(importProducts) || importProducts.length === 0) {
      return errorResponse('Products array is required', 400)
    }

    await delay(DELAY.SLOW)

    const results = {
      totalProcessed: importProducts.length,
      successCount: 0,
      failedCount: 0,
      errors: [] as Array<{ row: number; error: string }>,
      products: [] as Array<{
        id: string
        organizationId: string
        name: string
        description?: string
        category: string
        platform: string
        productUrl?: string
        campaignCount: number
        createdAt: string
        updatedAt: string
      }>,
    }

    importProducts.forEach((product, index) => {
      // Validate required fields
      if (!product.name || product.name.length < 2) {
        results.failedCount++
        results.errors.push({ row: index + 1, error: 'Name must be at least 2 characters' })
        return
      }

      if (!product.category) {
        results.failedCount++
        results.errors.push({ row: index + 1, error: 'Category is required' })
        return
      }

      if (!product.platform) {
        results.failedCount++
        results.errors.push({ row: index + 1, error: 'Platform is required' })
        return
      }

      // Validate category exists
      const categoryExists = mockCategories.some(
        c => c.name.toLowerCase() === product.category.toLowerCase() || c.slug === product.category
      )
      if (!categoryExists) {
        results.failedCount++
        results.errors.push({ row: index + 1, error: `Invalid category: ${product.category}` })
        return
      }

      // Validate platform exists
      const platformExists = mockPlatforms.some(
        p => p.name.toLowerCase() === product.platform.toLowerCase() || p.slug === product.platform
      )
      if (!platformExists) {
        results.failedCount++
        results.errors.push({ row: index + 1, error: `Invalid platform: ${product.platform}` })
        return
      }

      // Create the product
      results.successCount++
      const now = new Date().toISOString()
      results.products.push({
        id: `product-${Date.now()}-${index}`,
        organizationId: orgId,
        name: product.name,
        description: product.description,
        category: product.category,
        platform: product.platform,
        productUrl: product.productUrl,
        campaignCount: 0,
        createdAt: now,
        updatedAt: now,
      })
    })

    return successResponse(results)
  } catch (error) {
    console.error('Bulk import products error:', error)
    return serverErrorResponse('Failed to import products')
  }
}
