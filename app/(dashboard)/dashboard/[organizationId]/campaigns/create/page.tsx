import type { Metadata } from "next"
import { Suspense } from "react"
import { getProductsData } from "@/features/products/ssr"
import { CreateCampaignClient } from "./create-campaign-client"
import type { ProductWithStats } from "@/features/products"
import { logSSRError } from "@/lib/logging/error-logger-simple"

export const metadata: Metadata = {
	title: "Create Campaign",
	description: "Create a new influencer marketing campaign",
	openGraph: {
		title: "Create Campaign | Hypedrive",
		description: "Create a new influencer marketing campaign",
	},
}

interface PageProps {
	params: Promise<{ organizationId: string }>
}

async function CreateCampaignData({ organizationId }: { organizationId: string }) {
	let products: ProductWithStats[] = []
	try {
		const data = await getProductsData(organizationId)
		products = data.data ?? []
	} catch (error) {
		logSSRError(error, "getProductsData", "products-data", {})
		products = []
	}

	return <CreateCampaignClient products={products} />
}

export default async function CreateCampaignPage({ params }: PageProps) {
	// URL-based multi-tenancy: Get organizationId from URL params
	const { organizationId } = await params

	return (
		<Suspense fallback={<div className="p-8">Loading...</div>}>
			<CreateCampaignData organizationId={organizationId} />
		</Suspense>
	)
}
