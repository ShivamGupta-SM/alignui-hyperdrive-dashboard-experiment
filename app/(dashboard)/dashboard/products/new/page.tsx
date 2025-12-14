"use cache"

import { getCategoriesData, requireOrganization } from "@/lib/ssr-data"
import { NewProductClient } from "./new-product-client"

export default async function NewProductPage() {
	// Check if user has organization (server-side check)
	await requireOrganization()

	// Fetch categories server-side
	const categories = await getCategoriesData()

	return <NewProductClient categories={categories} />
}
