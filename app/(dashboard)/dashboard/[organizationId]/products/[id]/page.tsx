import { Suspense } from "react"
import { getProductDetailData } from "@/features/products/ssr"
import { ProductDetailClient } from "./product-detail-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logSSRError } from "@/lib/logging/error-logger-simple"
import { ProductDetailLoading } from "@/components/dashboard/loading-skeletons"

async function ProductData({ organizationId, id }: { organizationId: string; id: string }) {
	let data = null
	try {
		// API validates product belongs to organizationId via org-scoped endpoint
		data = await getProductDetailData(organizationId, id)
	} catch (error) {
		logSSRError(error, "getProductDetailData", "product-detail", { data: { organizationId, productId: id } })
		data = null
	}

	const initialData = data?.product ? {
		...data.product,
		campaigns: data.campaigns,
		categories: data.categories,
		platforms: data.platforms,
	} : undefined

	return <ProductDetailClient productId={id} initialData={initialData} />
}

export default async function ProductDetailPage({
	params,
}: {
	params: Promise<{ organizationId: string; id: string }>
}) {
	const { organizationId, id } = await params

	return (
		<OrganizationGuard pageType="products">
			<Suspense fallback={<ProductDetailLoading />}>
				<ProductData organizationId={organizationId} id={id} />
			</Suspense>
		</OrganizationGuard>
	)
}
