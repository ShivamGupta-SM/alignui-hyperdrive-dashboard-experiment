"use cache: private"

import { getCategoriesData, requireOrganization } from "@/lib/ssr-data"
import { NewProductClient } from "./new-product-client"

export default async function NewProductPage() {
	// Industry Standard: Session-based active organization (single source of truth)
	// Check if user has organization (server-side check)
	await requireOrganization()

	// Fetch categories server-side
	const categories = await getCategoriesData()

	return <NewProductClient categories={categories} />
}
