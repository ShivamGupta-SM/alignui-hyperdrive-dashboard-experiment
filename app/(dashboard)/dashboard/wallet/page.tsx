import type { Metadata } from "next"
import { Suspense } from "react"
import { getWalletData } from "@/lib/ssr-data"
import { WalletClient } from "./wallet-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logSSRError } from "@/lib/logging/error-logger-simple"

export const metadata: Metadata = {
	title: "Wallet",
	description: "Manage your wallet balance, withdrawals, and transactions",
	openGraph: {
		title: "Wallet | Hypedrive",
		description: "Manage your wallet balance, withdrawals, and transactions",
	},
}


async function WalletData() {
	try {
		const data = await getWalletData()
		// Industry Standard: Don't pass hasOrganization prop - use context instead
		return <WalletClient initialData={data ?? undefined} />
	} catch (error) {
		logSSRError(error, "getWalletData", "wallet-data", {})
		// Industry Standard: Return undefined, let context handle organization state
		return <WalletClient initialData={undefined} />
	}
}

function WalletLoadingFallback() {
	return <div className="p-8">Loading wallet...</div>
}

export default async function WalletPage() {
	// Industry Standard: Use OrganizationGuard for consistent UX
	return (
		<OrganizationGuard pageType="default">
			<Suspense fallback={<WalletLoadingFallback />}>
				<WalletData />
			</Suspense>
		</OrganizationGuard>
	)
}
