/**
 * Products API Mock Handlers
 */

import { http } from 'msw'
import { mockProducts, mockCategories, mockPlatforms, mockCampaigns } from '@/lib/mocks'
import { LIMITS } from '@/lib/types/constants'
import {
  delay,
  DELAY,
  getAuthContext,
  successResponse,
  notFoundResponse,
  errorResponse,
  paginatedResponse,
  calculatePagination,
  paginateArray,
} from './utils'

export const productsHandlers = [
  // GET /api/products
  http.get('/api/products', async ({ request }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)

    const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(url.searchParams.get('limit') || String(LIMITS.DEFAULT_PAGE_SIZE), 10)
    const category = url.searchParams.get('category')
    const platform = url.searchParams.get('platform')
    const search = url.searchParams.get('search')

    let products = mockProducts.filter(p => p.organizationId === orgId)

    if (category) {
      products = products.filter(p => p.category === category)
    }

    if (platform) {
      products = products.filter(p => p.platform === platform)
    }

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
  }),

  // GET /api/products/data
  http.get('/api/products/data', async ({ request }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const platform = url.searchParams.get('platform')

    const allProducts = mockProducts.filter(p => p.organizationId === orgId)

    let filteredProducts = allProducts
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category)
    }
    if (platform) {
      filteredProducts = filteredProducts.filter(p => p.platform === platform)
    }

    // Get unique categories for filters
    const uniqueCategories = [...new Set(allProducts.map(p => p.category))].filter(Boolean)

    // Calculate stats to match client expectations
    const stats = {
      total: allProducts.length,
      withCampaigns: allProducts.filter(p => p.campaignCount > 0).length,
      totalCampaigns: allProducts.reduce((sum, p) => sum + p.campaignCount, 0),
      categories: uniqueCategories.length,
    }

    return successResponse({
      products: filteredProducts,
      stats,
    })
  }),

  // GET /api/products/:id
  http.get('/api/products/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const product = mockProducts.find(
      p => p.id === id && p.organizationId === auth.organizationId
    )

    if (!product) {
      return notFoundResponse('Product')
    }

    return successResponse(product)
  }),

  // POST /api/products
  http.post('/api/products', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const body = await request.json() as Record<string, unknown>

    const { name, description, image, category, platform, productUrl } = body as {
      name?: string
      description?: string
      image?: string
      category?: string
      platform?: string
      productUrl?: string
    }

    if (!name || name.length < 2) {
      return errorResponse('Name must be at least 2 characters', 400)
    }

    if (!category) {
      return errorResponse('Category is required', 400)
    }

    if (!platform) {
      return errorResponse('Platform is required', 400)
    }

    const newProduct = {
      id: `product-${Date.now()}`,
      organizationId: orgId,
      name,
      description,
      image,
      category,
      platform,
      productUrl,
      campaignCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return successResponse(newProduct, 201)
  }),

  // PATCH /api/products/:id
  http.patch('/api/products/:id', async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params
    const body = await request.json() as Record<string, unknown>

    const product = mockProducts.find(
      p => p.id === id && p.organizationId === auth.organizationId
    )

    if (!product) {
      return notFoundResponse('Product')
    }

    const updatedProduct = {
      ...product,
      ...body,
      updatedAt: new Date(),
    }

    return successResponse(updatedProduct)
  }),

  // DELETE /api/products/:id
  http.delete('/api/products/:id', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const product = mockProducts.find(
      p => p.id === id && p.organizationId === auth.organizationId
    )

    if (!product) {
      return notFoundResponse('Product')
    }

    if (product.campaignCount > 0) {
      return errorResponse('Cannot delete a product with active campaigns', 400)
    }

    return successResponse({ message: 'Product deleted successfully' })
  }),

  // GET /api/categories
  http.get('/api/categories', async ({ request }) => {
    await delay(DELAY.FAST)

    const url = new URL(request.url)
    const activeOnly = url.searchParams.get('activeOnly') === 'true'

    let categories = [...mockCategories]

    if (activeOnly) {
      categories = categories.filter(c => c.isActive)
    }

    return successResponse(categories)
  }),

  // GET /api/categories/all
  http.get('/api/categories/all', async () => {
    await delay(DELAY.FAST)
    return successResponse(mockCategories)
  }),

  // GET /api/categories/:id
  http.get('/api/categories/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const { id } = params
    const category = mockCategories.find(c => c.id === id)

    if (!category) {
      return notFoundResponse('Category')
    }

    return successResponse(category)
  }),

  // GET /api/categories/name/:name
  http.get('/api/categories/name/:name', async ({ params }) => {
    await delay(DELAY.FAST)

    const { name } = params
    const category = mockCategories.find(
      c => c.slug === name || c.name.toLowerCase() === (name as string).toLowerCase()
    )

    if (!category) {
      return notFoundResponse('Category')
    }

    return successResponse(category)
  }),

  // GET /api/categories/:id/products
  http.get('/api/categories/:id/products', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const category = mockCategories.find(c => c.id === id)

    if (!category) {
      return notFoundResponse('Category')
    }

    const products = mockProducts.filter(
      p => p.organizationId === auth.organizationId && p.category === category.name
    )

    return successResponse({
      category,
      products,
    })
  }),

  // GET /api/platforms
  http.get('/api/platforms', async ({ request }) => {
    await delay(DELAY.FAST)

    const url = new URL(request.url)
    const activeOnly = url.searchParams.get('activeOnly') === 'true'

    let platforms = [...mockPlatforms]

    if (activeOnly) {
      platforms = platforms.filter(p => p.isActive)
    }

    return successResponse(platforms)
  }),

  // GET /api/platforms/active
  http.get('/api/platforms/active', async () => {
    await delay(DELAY.FAST)
    return successResponse(mockPlatforms.filter(p => p.isActive))
  }),

  // GET /api/platforms/:id
  http.get('/api/platforms/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const { id } = params
    const platform = mockPlatforms.find(p => p.id === id)

    if (!platform) {
      return notFoundResponse('Platform')
    }

    return successResponse(platform)
  }),

  // GET /api/platforms/name/:name
  http.get('/api/platforms/name/:name', async ({ params }) => {
    await delay(DELAY.FAST)

    const { name } = params
    const platform = mockPlatforms.find(
      p => p.slug === name || p.name.toLowerCase() === (name as string).toLowerCase()
    )

    if (!platform) {
      return notFoundResponse('Platform')
    }

    return successResponse(platform)
  }),

  // POST /api/products/bulk-import - Bulk import products
  http.post('/api/products/bulk-import', async ({ request }) => {
    await delay(DELAY.SLOW)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const body = await request.json() as Record<string, unknown>

    const { products: importProducts } = body as {
      products?: Array<{
        name: string
        description?: string
        category: string
        platform: string
        productUrl?: string
        price?: number
        sku?: string
      }>
    }

    if (!importProducts || !Array.isArray(importProducts) || importProducts.length === 0) {
      return errorResponse('Products array is required', 400)
    }

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
        createdAt: Date
        updatedAt: Date
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
      results.products.push({
        id: `product-${Date.now()}-${index}`,
        organizationId: orgId,
        name: product.name,
        description: product.description,
        category: product.category,
        platform: product.platform,
        productUrl: product.productUrl,
        campaignCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })

    return successResponse(results)
  }),

  // GET /api/products/:id/campaigns - Get campaigns using this product
  http.get('/api/products/:id/campaigns', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const product = mockProducts.find(
      p => p.id === id && p.organizationId === auth.organizationId
    )

    if (!product) {
      return notFoundResponse('Product')
    }

    // Generate mock campaign summaries for this product
    const productCampaigns = mockCampaigns
      .filter(c => c.organizationId === auth.organizationId)
      .slice(0, product.campaignCount || 3)
      .map(c => ({
        id: c.id,
        title: c.title,
        status: c.status,
        enrollmentCount: Math.floor(Math.random() * 50) + 5,
        approvalCount: Math.floor(Math.random() * 30) + 2,
        totalPayout: Math.round(Math.random() * 100000) + 10000,
        startDate: c.startDate,
        endDate: c.endDate,
      }))

    return successResponse(productCampaigns)
  }),
]
