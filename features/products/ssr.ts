/**
 * Products SSR Data Fetching
 *
 * Server-side data fetching for product pages.
 * Uses ssrFetch helper for standardized error handling.
 */

import { ssrFetch } from "@/lib/api/server"
import { getAuthClient } from "@/lib/auth/server"
import { logSSRError } from "@/lib/logging/error-logger-simple"
import { SSR_PAGE_SIZE } from "@/lib/utils/query-config"

// Default fallback for products data
const EMPTY_PRODUCTS_RESPONSE = {
	data: [],
	total: 0,
	categories: [],
	platforms: [],
}

/**
 * Get products list with categories and platforms
 * Uses ssrFetch for standardized error handling
 */
export async function getProductsData(organizationId: string) {
	return ssrFetch(
		{
			source: "getProductsData",
			feature: "products",
			context: { organizationId },
		},
		async (client) => {
			const results = await Promise.allSettled([
				client.organizations.listOrganizationProducts(organizationId, { skip: 0, take: SSR_PAGE_SIZE.LARGE }),
				client.products.listAllCategories(),
				client.platforms.listActivePlatforms(),
			])

			const products = results[0].status === "fulfilled" ? results[0].value : { data: [], total: 0 }
			const categories = results[1].status === "fulfilled" ? results[1].value : { categories: [] }
			const platforms = results[2].status === "fulfilled" ? results[2].value : { platforms: [] }

			// Log errors for failed promises
			results.forEach((result, index) => {
				if (result.status === "rejected") {
					const names = ["products", "categories", "platforms"]
					logSSRError(result.reason, "getProductsData", `products-${names[index]}`, {})
				}
			})

			return {
				data: products.data || [],
				total: products.total || 0,
				categories: categories.categories || [],
				platforms: platforms.platforms || [],
			}
		},
		EMPTY_PRODUCTS_RESPONSE
	)
}

/**
 * Get categories for product form (server-side)
 */
export async function getCategoriesData() {
	const client = await getAuthClient()
	const result = await client.products.listAllCategories()
	return result.categories || []
}

// Default fallback for single product
const EMPTY_PRODUCT_RESPONSE = {
	product: null,
	campaigns: [],
	categories: [],
	platforms: [],
}

/**
 * Get single product with campaigns
 * Uses ssrFetch for standardized error handling
 */
export async function getProductDetailData(organizationId: string, productId: string) {
	return ssrFetch(
		{
			source: "getProductDetailData",
			feature: "products",
			context: { organizationId, productId },
		},
		async (client) => {
			const results = await Promise.allSettled([
				client.organizations.getOrganizationProduct(organizationId, productId),
				client.organizations.listProductCampaigns(organizationId, productId, { skip: 0, take: 50 }),
				client.products.listAllCategories(),
				client.platforms.listActivePlatforms(),
			])

			const product = results[0].status === "fulfilled" ? results[0].value : null
			const campaignsRes = results[1].status === "fulfilled" ? results[1].value : { data: [] }
			const categories = results[2].status === "fulfilled" ? results[2].value : { categories: [] }
			const platforms = results[3].status === "fulfilled" ? results[3].value : { platforms: [] }

			// Log errors for failed promises
			results.forEach((result, index) => {
				if (result.status === "rejected") {
					const names = ["product", "campaigns", "categories", "platforms"]
					logSSRError(result.reason, "getProductDetailData", `product-${names[index]}`, {})
				}
			})

			return {
				product,
				campaigns: campaignsRes.data || [],
				categories: categories.categories || [],
				platforms: platforms.platforms || [],
			}
		},
		EMPTY_PRODUCT_RESPONSE
	)
}
