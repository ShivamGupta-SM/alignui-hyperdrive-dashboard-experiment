import type { Metadata } from "next"
import { Suspense } from "react"
import { getProductsData } from "@/lib/ssr-data"
import { ProductsClient } from "./products-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logSSRError } from "@/lib/logging/error-logger-simple"

export const metadata: Metadata = {
	title: "Products",
	description: "Manage your product catalog for campaigns",
	openGraph: {
		title: "Products | Hypedrive",
		description: "Manage your product catalog for campaigns",
	},
}


async function ProductsData() {
	try {
		const data = await getProductsData()
		// Industry Standard: Don't pass hasOrganization prop - use context instead
		return <ProductsClient initialData={data || { data: [], total: 0 }} />
	} catch (error) {
		logSSRError(error, "getProductsData", "products-data", {})
		// Industry Standard: Return empty data, let context handle organization state
		return <ProductsClient initialData={{ data: [], total: 0 }} />
	}
}

export default async function ProductsPage() {
	// Industry Standard: Use OrganizationGuard for consistent UX
	return (
		<OrganizationGuard pageType="products">
			<Suspense fallback={<div className="p-8">Loading products...</div>}>
				<ProductsData />
			</Suspense>
		</OrganizationGuard>
	)
}
