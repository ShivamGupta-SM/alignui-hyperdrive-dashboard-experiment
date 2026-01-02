import type { Metadata } from "next"
import { Suspense } from "react"
import { getCategoriesData } from "@/features/products/ssr"
import { NewProductClient } from "./new-product-client"
import type { products } from "@/brand-client"
import { logSSRError } from "@/lib/logging/error-logger-simple"
import { NewProductLoading } from "@/components/dashboard/loading-skeletons"

export const metadata: Metadata = {
	title: "New Product",
	description: "Create a new product for your campaigns",
	openGraph: {
		title: "New Product | Hypedrive",
		description: "Create a new product for your campaigns",
	},
}

async function NewProductData() {
	let categories: products.ProductCategory[] = []
	try {
		categories = await getCategoriesData()
	} catch (error) {
		logSSRError(error, "getCategoriesData", "categories-data", {})
		categories = []
	}

	return <NewProductClient categories={categories} />
}

export default async function NewProductPage() {
	return (
		<Suspense fallback={<NewProductLoading />}>
			<NewProductData />
		</Suspense>
	)
}
