import type { Metadata } from "next"
import { getCategoriesData } from "@/lib/ssr-data"
import { NewProductClient } from "./new-product-client"
import type { products } from "@/lib/encore-client"
import { logSSRError } from "@/lib/error-logger-simple"

export const metadata: Metadata = {
	title: "New Product",
	description: "Create a new product for your campaigns",
	openGraph: {
		title: "New Product | Hypedrive",
		description: "Create a new product for your campaigns",
	},
}

export default async function NewProductPage() {
	// Industry Standard: Fetch data, let context handle organization state
	let categories: products.ProductCategory[] = []
	try {
		categories = await getCategoriesData()
	} catch (error) {
		logSSRError(error, "getCategoriesData", "categories-data", {})
		categories = []
	}

	// Industry Standard: Don't pass hasOrganization prop - use context instead
	return <NewProductClient categories={categories} />
}
