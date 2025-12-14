"use cache"

import { getProductsData, requireOrganization } from "@/lib/ssr-data"
import { CreateCampaignClient } from "./create-campaign-client"

export default async function CreateCampaignPage() {
	// Check if user has organization
	await requireOrganization()

	// Server-side fetch of products
	const data = await getProductsData()
	const products = data.data ?? []

	return <CreateCampaignClient products={products} />
}
