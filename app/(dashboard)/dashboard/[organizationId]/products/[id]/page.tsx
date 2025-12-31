import { Suspense } from "react"
import { getProductDetailData } from "@/features/products/ssr"
import { ProductDetailClient } from "./product-detail-client"
import { logSSRError } from "@/lib/logging/error-logger-simple"

async function ProductData({ organizationId, id }: { organizationId: string; id: string }) {
	let data = null
	try {
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
		<Suspense fallback={<div className="p-8">Loading product...</div>}>
			<ProductData organizationId={organizationId} id={id} />
		</Suspense>
	)
}
