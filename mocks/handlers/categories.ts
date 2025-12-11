/**
 * Categories API Mock Handlers
 */

import { http } from 'msw'
import { mockCategories, mockProducts } from '@/lib/mocks'
import { LIMITS } from '@/lib/types/constants'
import {
  delay,
  DELAY,
  successResponse,
  notFoundResponse,
  paginatedResponse,
  calculatePagination,
  paginateArray,
} from './utils'

export const categoriesHandlers = [
  // GET /api/categories - List active categories (hierarchical)
  http.get('/api/categories', async () => {
    await delay(DELAY.FAST)

    const activeCategories = mockCategories.filter(c => c.isActive)
    return successResponse(activeCategories)
  }),

  // GET /api/categories/all - List all categories (flat, including inactive)
  http.get('/api/categories/all', async () => {
    await delay(DELAY.FAST)

    return successResponse(mockCategories)
  }),

  // GET /api/categories/:id - Get single category by ID
  http.get('/api/categories/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const { id } = params
    const category = mockCategories.find(c => c.id === id)

    if (!category) {
      return notFoundResponse('Category')
    }

    return successResponse(category)
  }),

  // GET /api/categories/name/:name - Get category by name/slug
  http.get('/api/categories/name/:name', async ({ params }) => {
    await delay(DELAY.FAST)

    const { name } = params
    const decodedName = decodeURIComponent(name as string).toLowerCase()

    const category = mockCategories.find(
      c => c.name.toLowerCase() === decodedName || c.slug === decodedName
    )

    if (!category) {
      return notFoundResponse('Category')
    }

    return successResponse(category)
  }),

  // GET /api/categories/:id/products - Get products in a category
  http.get('/api/categories/:id/products', async ({ params, request }) => {
    await delay(DELAY.STANDARD)

    const { id } = params
    const url = new URL(request.url)

    const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(url.searchParams.get('limit') || String(LIMITS.DEFAULT_PAGE_SIZE), 10)

    const category = mockCategories.find(c => c.id === id)

    if (!category) {
      return notFoundResponse('Category')
    }

    // Filter products by category name (mock doesn't have categoryId)
    const categoryProducts = mockProducts.filter(
      p => p.category.toLowerCase() === category.name.toLowerCase()
    )

    const total = categoryProducts.length
    const paginatedProducts = paginateArray(categoryProducts, page, limit)
    const meta = calculatePagination(total, page, limit)

    return paginatedResponse(paginatedProducts, meta)
  }),
]
