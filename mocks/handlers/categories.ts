/**
 * Categories API Mock Handlers
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import { encoreUrl, encoreResponse, encoreListResponse, encoreNotFoundResponse } from './utils'

export const categoriesHandlers = [
  // GET /categories - List categories
  http.get(encoreUrl('/categories'), async () => {
    const categories = db.categories.findMany()
    return encoreListResponse(categories, categories.length, 0, 50)
  }),

  // GET /categories/all - All categories
  http.get(encoreUrl('/categories/all'), async () => {
    const categories = db.categories.findMany()
    return encoreResponse({ categories })
  }),

  // GET /categories/:id
  http.get(encoreUrl('/categories/:id'), async ({ params }) => {
    const { id } = params
    const category = mockCategories.find(c => c.id === id)
    if (!category) return encoreNotFoundResponse('Category')
    return encoreResponse(category)
  }),

  // GET /categories/:id/products
  http.get(encoreUrl('/categories/:id/products'), async ({ params, request }) => {
    const { id } = params
    const url = new URL(request.url)
    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)

    const category = db.categories.findFirst((q) => q.where({ id }))
    if (!category) return encoreNotFoundResponse('Category')

    const products = db.products.findMany((q) => q.where({ categoryId: category.id }))
    return encoreListResponse(products.slice(skip, skip + take), products.length, skip, take)
  }),
]
