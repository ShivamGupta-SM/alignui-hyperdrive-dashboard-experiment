/**
 * Products API - Single source of truth for all product operations
 */

import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import type { products } from "@/lib/api/encore-client"
import type { Product, ProductWithStats } from '../types'

/**
 * List products with filters
 * 
 * @param params - List parameters (pagination, filters)
 * @returns Paginated products response
 */
export async function listProducts(
	params?: products.ListProductsParams
): Promise<{
	data: ProductWithStats[]
	total: number
	skip: number
	take: number
	hasMore: boolean
}> {
	const client = getEncoreBrowserClient()
	return client.products.listProducts(params || {})
}

/**
 * Get product by ID
 * 
 * @param id - Product ID
 * @returns Product data
 */
export async function getProductById(id: string): Promise<Product> {
	const client = getEncoreBrowserClient()
	return client.products.getProduct(id)
}

/**
 * List categories
 * 
 * @param params - List parameters (pagination)
 * @returns Categories response
 */
export async function listCategories(params?: { skip?: number; take?: number }) {
	const client = getEncoreBrowserClient()
	return client.products.listCategories(params || {})
}

/**
 * List all categories (flat list)
 * 
 * @returns All categories
 */
export async function listAllCategories() {
	const client = getEncoreBrowserClient()
	return client.products.listAllCategories()
}

/**
 * Get category by ID
 * 
 * @param id - Category ID
 * @returns Category data
 */
export async function getCategory(id: string) {
	const client = getEncoreBrowserClient()
	return client.products.getCategory(id)
}

/**
 * Get category by name
 * 
 * @param name - Category name/slug
 * @returns Category data
 */
export async function getCategoryByName(name: string) {
	const client = getEncoreBrowserClient()
	return client.products.getCategoryByName(name)
}

/**
 * Get products in a category
 * 
 * @param id - Category ID
 * @param params - List parameters (pagination)
 * @returns Products in category
 */
export async function getCategoryProducts(id: string, params?: { skip?: number; take?: number }) {
	const client = getEncoreBrowserClient()
	return client.products.getCategoryProducts(id, params || {})
}

