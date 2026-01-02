import type { Metadata } from "next"
import { Suspense } from "react"
import { getWalletData } from "@/features/wallet/ssr"
import { WalletClient } from "./wallet-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logSSRError } from "@/lib/logging/error-logger-simple"
import WalletLoading from "./loading"

export const metadata: Metadata = {
	title: "Wallet",
	description: "Manage your wallet balance, withdrawals, and transactions",
	openGraph: {
		title: "Wallet | Hypedrive",
		description: "Manage your wallet balance, withdrawals, and transactions",
	},
}

interface PageProps {
	params: Promise<{ organizationId: string }>
}

async function WalletData({ organizationId }: { organizationId: string }) {
	try {
		// URL-based multi-tenancy: pass organizationId from URL params
		const data = await getWalletData(organizationId)
		return <WalletClient initialData={data ?? undefined} />
	} catch (error) {
		logSSRError(error, "getWalletData", "wallet-data", {})
		return <WalletClient initialData={undefined} />
	}
}

export default async function WalletPage({ params }: PageProps) {
	const { organizationId } = await params
	return (
		<OrganizationGuard pageType="default">
			<Suspense fallback={<WalletLoading />}>
				<WalletData organizationId={organizationId} />
			</Suspense>
		</OrganizationGuard>
	)
}
