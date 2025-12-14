"use cache"

import { getWalletData, requireOrganization } from "@/lib/ssr-data"
import { WalletClient } from "./wallet-client"

export default async function WalletPage() {
	// Check if user has organization
	await requireOrganization()

	// Direct server fetch - pure RSC
	const data = await getWalletData()

	return <WalletClient initialData={data} />
}
