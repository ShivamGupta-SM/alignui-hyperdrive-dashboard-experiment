import type { Metadata } from "next"
import { Suspense } from "react"
import { getProductsData } from "@/features/products/ssr"
import { ProductsClient } from "./products-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logSSRError } from "@/lib/logging/error-logger-simple"
import ProductsLoading from "./loading"

export const metadata: Metadata = {
	title: "Products",
	description: "Manage your product catalog for campaigns",
	openGraph: {
		title: "Products | Hypedrive",
		description: "Manage your product catalog for campaigns",
	},
}

// URL-based multi-tenancy: organizationId from URL params
interface ProductsPageProps {
	params: Promise<{ organizationId: string }>
}

async function ProductsData({ organizationId }: { organizationId: string }) {
	try {
		// SSOT: Pass organizationId from URL to SSR function
		const data = await getProductsData(organizationId)
		return <ProductsClient initialData={data || { data: [], total: 0 }} />
	} catch (error) {
		logSSRError(error, "getProductsData", "products-data", {})
		return <ProductsClient initialData={{ data: [], total: 0 }} />
	}
}

export default async function ProductsPage({ params }: ProductsPageProps) {
	// URL-based multi-tenancy: extract organizationId from URL params
	const { organizationId } = await params

	return (
		<OrganizationGuard pageType="products">
			<Suspense fallback={<ProductsLoading />}>
				<ProductsData organizationId={organizationId} />
			</Suspense>
		</OrganizationGuard>
	)
}
