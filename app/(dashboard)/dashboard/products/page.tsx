"use cache"

import { getProductsData, requireOrganization } from "@/lib/ssr-data"
import { ProductsClient } from "./products-client"
import { cookies } from "next/headers"

export default async function ProductsPage() {
	// CRITICAL: Access request data (cookies) FIRST before any API calls
	// This ensures Next.js can properly handle static generation
	const cookieStore = await cookies()
	cookieStore.toString() // Touch cookies to mark as dynamic

	// Check if user has organization
	await requireOrganization()

	// Direct server fetch - pure RSC
	const data = await getProductsData()

	return <ProductsClient initialData={data} />
}
