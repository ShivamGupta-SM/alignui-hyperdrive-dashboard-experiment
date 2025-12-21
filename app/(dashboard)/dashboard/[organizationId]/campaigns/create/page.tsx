import type { Metadata } from "next"
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

export default async function CreateCampaignPage() {
	// Industry Standard: Fetch data, let context handle organization state
	let products: ProductWithStats[] = []
	try {
		const data = await getProductsData()
		products = data.data ?? []
	} catch (error) {
		logSSRError(error, "getProductsData", "products-data", {})
		products = []
	}

	// Industry Standard: Don't pass hasOrganization prop - use context instead
	return <CreateCampaignClient products={products} />
}
