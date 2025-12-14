"use cache: private"

import { getWalletData, getOrganizationIdOrNull } from "@/lib/ssr-data"
import { WalletClient } from "./wallet-client"

export default async function WalletPage() {
	// Industry Standard: Session-based active organization (single source of truth)
	// Check if user has organization (graceful - don't force redirect)
	const orgId = await getOrganizationIdOrNull()
	const hasOrganization = !!orgId

	// Fetch wallet data if organization exists
	let data = null
	if (hasOrganization && orgId) {
		data = await getWalletData()
	}

	return <WalletClient initialData={data} hasOrganization={hasOrganization} />
}
