// Server-side data fetching for products
// This file uses the Encore backend client for type-safe API calls
import 'server-only'

import { getEncoreClient, type products as productsApi } from '@/lib/encore'
import { mockProducts } from '@/lib/mocks'
import type { Product } from '@/lib/types'

// Feature flag to control whether to use Encore or mock data
const USE_ENCORE = !!process.env.ENCORE_API_URL

export interface GetProductsParams {
  search?: string
  category?: string
  platform?: string
  organizationId?: string
  page?: number
  pageSize?: number
}

/**
 * Convert Encore ProductWithStats to Frontend Product type
 * This includes isActive and campaignCount from the API
 */
function toFrontendProductWithStats(product: productsApi.ProductWithStats): Product {
  return {
    id: product.id,
    organizationId: product.organizationId,
    name: product.name,
    description: product.description,
    sku: product.sku,
    price: product.price,
    category: product.categoryId || '',
    platform: product.platformId || '',
    productUrl: product.productLink,
    imageUrl: product.productImages?.[0],
    images: product.productImages || [],
    campaignCount: product.campaignCount,
    isActive: product.isActive,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  }
}

/**
 * Fetch products from Encore backend
 * Uses ProductWithStats which includes isActive and campaignCount
 */
async function fetchProductsFromEncore(
  organizationId: string,
  params?: GetProductsParams
): Promise<Product[]> {
  const client = getEncoreClient()

  const encoreParams: productsApi.ListOrganizationProductsParams = {
    skip: params?.page ? (params.page - 1) * (params.pageSize || 10) : 0,
    take: params?.pageSize || 50,
  }

  // listOrganizationProducts returns ProductWithStats[] with isActive and campaignCount
  const response = await client.products.listOrganizationProducts(organizationId, encoreParams)
  return response.data.map(toFrontendProductWithStats)
}

export async function getProducts(params?: GetProductsParams): Promise<Product[]> {
  if (USE_ENCORE && params?.organizationId) {
    try {
      let products = await fetchProductsFromEncore(params.organizationId, params)

      // Apply client-side filters for category/platform/search
      if (params?.category && params.category !== 'all') {
        products = products.filter(p => p.category === params.category)
      }
      if (params?.platform && params.platform !== 'all') {
        products = products.filter(p => p.platform === params.platform)
      }
      if (params?.search) {
        const searchLower = params.search.toLowerCase()
        products = products.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
        )
      }

      return products
    } catch (error) {
      console.error('Failed to fetch products from Encore, falling back to mocks:', error)
    }
  }

  // Fallback to mock data
  let products = [...mockProducts]

  // Filter by category
  if (params?.category && params.category !== 'all') {
    products = products.filter(p => p.category === params.category)
  }

  // Filter by platform
  if (params?.platform && params.platform !== 'all') {
    products = products.filter(p => p.platform === params.platform)
  }

  // Search by name
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    products = products.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower)
    )
  }

  return products
}

export async function getProductById(id: string): Promise<Product | null> {
  if (USE_ENCORE) {
    try {
      const client = getEncoreClient()
      // getProduct returns ProductWithStats with isActive and campaignCount
      const product = await client.products.getProduct(id)
      return toFrontendProductWithStats(product)
    } catch (error) {
      console.error('Failed to fetch product from Encore:', error)
    }
  }
  return mockProducts.find(p => p.id === id) || null
}

export interface ProductStats {
  total: number
  withCampaigns: number
  totalCampaigns: number
  categories: number
}

export interface ProductsData {
  products: Product[]
  stats: ProductStats
}

/**
 * Get all products data for SSR hydration
 */
export async function getProductsData(organizationId?: string): Promise<ProductsData> {
  const products = await getProducts({ organizationId })

  const stats: ProductStats = {
    total: products.length,
    withCampaigns: products.filter(p => p.campaignCount > 0).length,
    totalCampaigns: products.reduce((acc, p) => acc + p.campaignCount, 0),
    categories: new Set(products.map(p => p.category)).size,
  }

  return {
    products,
    stats,
  }
}
