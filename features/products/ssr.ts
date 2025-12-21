/**
 * Products SSR Data Fetching
 *
 * Server-side data fetching for product pages.
 * Organized by feature for clean architecture.
 */

import { getAuthClient } from "@/lib/auth/server"
import { isAuthenticationError } from "@/lib/errors/encore-error-handler"
import { logSSRError, logWarn } from "@/lib/logging/error-logger-simple"
import { getErrorMessageForLog } from "@/lib/utils/format"

/**
 * Get products list with categories and platforms
 */
export async function getProductsData() {
	try {
		const client = await getAuthClient()
		const session = await client.auth.getSession()

		if (!session?.user) {
			logWarn("User not authenticated, returning empty products data", { source: "getProductsData" })
			return {
				data: [],
				total: 0,
				categories: [],
				platforms: [],
			}
		}

		const results = await Promise.allSettled([
			client.products.listProducts({ skip: 0, take: 100 }),
			client.products.listAllCategories(),
			client.integrations.listActivePlatforms(),
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
	} catch (error) {
		// Handle authentication errors gracefully
		if (isAuthenticationError(error)) {
			logWarn("Authentication error in getProductsData, returning empty data", {
				source: "getProductsData",
				data: { errorMessage: getErrorMessageForLog(error) },
			})
			return {
				data: [],
				total: 0,
				categories: [],
				platforms: [],
			}
		}

		logSSRError(error, "getProductsData", "products-data", {})
		return {
			data: [],
			total: 0,
			categories: [],
			platforms: [],
		}
	}
}

/**
 * Get categories for product form (server-side)
 */
export async function getCategoriesData() {
	const client = await getAuthClient()
	const result = await client.products.listAllCategories()
	return result.categories || []
}
