/**
 * Products API Mock Handlers
 * 
 * Intercepts Encore API calls at localhost:4000/products
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import {
  getAuthContext,
  encoreUrl,
  encoreResponse,
  encoreListResponse,
  encoreErrorResponse,
  encoreNotFoundResponse,
} from './utils'

// Product already in Encore format from database, just add stats
function toProductWithStats(product: any) {
  const campaigns = db.campaigns.findMany((q) => q.where({ productId: product.id }))
  
  return {
    isActive: product.isActive ?? true,
    campaignCount: campaigns.length,
    ...product, // All other fields already in Encore format
  }
}

export const productsHandlers = [
  // GET /products - List products (Encore: products.listProducts)
  http.get(encoreUrl('/products'), async ({ request }) => {
    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)
    const categoryId = url.searchParams.get('categoryId')
    const platformId = url.searchParams.get('platformId')
    const search = url.searchParams.get('search')

    let products = db.products.findMany((q) => q.where({ organizationId: orgId }))

    if (categoryId) {
      products = products.filter(p => p.category === categoryId)
    }
    if (platformId) {
      products = products.filter(p => p.platform === platformId)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      )
    }

    products.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const total = products.length
    const paginatedProducts = products.slice(skip, skip + take)

    return encoreListResponse(paginatedProducts.map(toProductWithStats), total, skip, take)
  }),

  // GET /products/:id - Get product (Encore: products.getProduct)
  http.get(encoreUrl('/products/:id'), async ({ params }) => {
    const auth = getAuthContext()
    const { id } = params

    const product = db.products.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!product) {
      return encoreNotFoundResponse('Product')
    }

    return encoreResponse(toProductWithStats(product))
  }),

  // POST /products - Create product (Encore: products.createProduct)
  http.post(encoreUrl('/products'), async ({ request }) => {
    const auth = getAuthContext()
    const body = await request.json() as { name: string; description?: string; categoryId?: string; platformId?: string }

    if (!body.name) {
      return encoreErrorResponse('Product name is required', 400)
    }

    const newProduct = {
      id: `prod-${Date.now()}`,
      organizationId: auth.organizationId,
      name: body.name,
      description: body.description || '',
      category: body.categoryId,
      platform: body.platformId,
      image: undefined,
      productUrl: undefined,
      campaignCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return encoreResponse(toProductWithStats(newProduct))
  }),

  // PUT /products/:id - Update product
  http.put(encoreUrl('/products/:id'), async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params
    const body = await request.json() as { name?: string; description?: string }

    const product = db.products.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!product) {
      return encoreNotFoundResponse('Product')
    }

    const updated = { ...product, ...body, updatedAt: new Date() }
    return encoreResponse(toProductWithStats(updated))
  }),

  // DELETE /products/:id
  http.delete(encoreUrl('/products/:id'), async ({ params }) => {
    const auth = getAuthContext()
    const { id } = params

    const product = db.products.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!product) {
      return encoreNotFoundResponse('Product')
    }

    const campaigns = db.campaigns.findMany((q) => q.where({ productId: id }))
    if (campaigns.length > 0) {
      return encoreErrorResponse('Cannot delete product with active campaigns', 400)
    }

    return encoreResponse({ deleted: true })
  }),

  // GET /products/categories - List categories
  http.get(encoreUrl('/products/categories'), async () => {
    return encoreListResponse(mockCategories, mockCategories.length, 0, 50)
  }),

  // GET /products/platforms - List platforms  
  http.get(encoreUrl('/products/platforms'), async () => {
    return encoreListResponse(mockPlatforms, mockPlatforms.length, 0, 50)
  }),

  // POST /products/batch/import - Encore uses this URL
  http.post(encoreUrl('/products/batch/import'), async ({ request }) => {
    const body = await request.json() as { products: Array<{ name: string }> }

    if (!body.products || !Array.isArray(body.products)) {
      return encoreErrorResponse('Products array is required', 400)
    }

    return encoreResponse({
      imported: body.products.length,
      failed: 0,
      errors: [],
      total: body.products.length,
    })
  }),
]
