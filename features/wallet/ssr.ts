/**
 * Wallet SSR Data Fetching
 *
 * Server-side data fetching for wallet pages.
 * Uses ssrFetch helper for standardized error handling.
 */

import { ssrFetch } from "@/lib/api/server"
import { logSSRError } from "@/lib/logging/error-logger-simple"
import { SSR_PAGE_SIZE } from "@/lib/utils/query-config"

// SSOT: Default wallet data structure for fallback
// Note: 'balance' field matches WalletClientProps interface
const EMPTY_WALLET_RESPONSE = {
	balance: null,
	withdrawals: [],
	transactions: [],
	activeHolds: [],
}

/**
 * Get wallet data for organization
 * Uses ssrFetch for standardized error handling
 *
 * SSOT: Returns consistent structure with proper null handling
 */
export async function getWalletData(organizationId: string) {
	return ssrFetch(
		{
			source: "getWalletData",
			feature: "wallet",
			context: { organizationId },
		},
		async (client) => {
			const results = await Promise.allSettled([
				client.organizations.getOrganizationWallet(organizationId),
				client.organizations.listOrganizationWithdrawals(organizationId, { skip: 0, take: SSR_PAGE_SIZE.DEFAULT }),
				client.organizations.getOrganizationWalletTransactions(organizationId, { skip: 0, take: SSR_PAGE_SIZE.DEFAULT }),
				client.organizations.getWalletHolds(organizationId),
			])

			// SSOT: Extract data with consistent null handling
			const walletResult = results[0]
			const withdrawalsResult = results[1]
			const transactionsResult = results[2]
			const holdsResult = results[3]

			const wallet = walletResult.status === "fulfilled" ? walletResult.value : null
			const withdrawalsData = withdrawalsResult.status === "fulfilled" ? withdrawalsResult.value : null
			const transactionsData = transactionsResult.status === "fulfilled" ? transactionsResult.value : null
			const holdsData = holdsResult.status === "fulfilled" ? holdsResult.value : null

			// Log errors for failed promises
			const names = ["wallet", "withdrawals", "transactions", "holds"]
			results.forEach((result, index) => {
				if (result.status === "rejected") {
					logSSRError(result.reason, "getWalletData", `wallet-${names[index]}`, {
						data: { organizationId },
					})
				}
			})

			// SSOT: Return consistent structure matching WalletClientProps
			// 'balance' field matches the client interface
			return {
				balance: wallet,
				withdrawals: withdrawalsData?.data ?? [],
				transactions: transactionsData?.data ?? [],
				activeHolds: holdsData?.holds ?? [],
			}
		},
		EMPTY_WALLET_RESPONSE
	)
}
