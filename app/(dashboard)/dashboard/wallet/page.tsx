"use cache"

import type { Metadata } from "next"
import { Suspense } from "react"
import { getWalletData } from "@/lib/ssr-data"
import { WalletClient } from "./wallet-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logSSRError } from "@/lib/error-logger-simple"

export const metadata: Metadata = {
	title: "Wallet",
	description: "Manage your wallet balance, withdrawals, and transactions",
	openGraph: {
		title: "Wallet | Hypedrive",
		description: "Manage your wallet balance, withdrawals, and transactions",
	},
}

// Note: dynamic and revalidate exports removed - incompatible with cacheComponents

async function WalletData() {
	try {
		const data = await getWalletData()
		// Industry Standard: Don't pass hasOrganization prop - use context instead
		return <WalletClient initialData={data} />
	} catch (error) {
		logSSRError(error, "getWalletData", "wallet-data", {})
		// Industry Standard: Return null, let context handle organization state
		return <WalletClient initialData={null} />
	}
}

export default async function WalletPage() {
	// Industry Standard: Use OrganizationGuard for consistent UX
	return (
		<OrganizationGuard pageType="default">
			<Suspense fallback={<div className="p-8">Loading wallet...</div>}>
				<WalletData />
			</Suspense>
		</OrganizationGuard>
	)
}
