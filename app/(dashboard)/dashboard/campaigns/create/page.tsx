"use cache: private"

import { getProductsData, requireOrganization } from "@/lib/ssr-data"
import { CreateCampaignClient } from "./create-campaign-client"

export default async function CreateCampaignPage() {
	// Industry Standard: Session-based active organization (single source of truth)
	// Check if user has organization
	await requireOrganization()

	// Server-side fetch of products
	const data = await getProductsData()
	const products = data.data ?? []

	return <CreateCampaignClient products={products} />
}
