"use cache: private"

import { getProductsData, requireOrganization } from "@/lib/ssr-data"
import { ProductsClient } from "./products-client"

export default async function ProductsPage() {
	// Industry Standard: Session-based active organization (single source of truth)
	// Check if user has organization
	await requireOrganization()

	// Direct server fetch - pure RSC
	const data = await getProductsData()

	return <ProductsClient initialData={data} />
}
