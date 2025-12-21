/**
 * Wallet SSR Data Fetching
 *
 * Server-side data fetching for wallet pages.
 * Organized by feature for clean architecture.
 */

import { getAuthClient } from "@/lib/auth/server"
import { isAuthenticationError } from "@/lib/errors/encore-error-handler"
import { logSSRError, logWarn } from "@/lib/logging/error-logger-simple"
import { getErrorMessageForLog } from "@/lib/utils/format"

/**
 * Get wallet data for organization
 */
export async function getWalletData(organizationId: string) {
	try {
		const client = await getAuthClient()
		const session = await client.auth.getSession()

		if (!session?.user) {
			logWarn("User not authenticated, returning null wallet data", { source: "getWalletData" })
			return null
		}

		// URL-based multi-tenancy: pass organizationId to all wallet endpoints
		const results = await Promise.allSettled([
			client.wallets.getOrganizationWallet({ organizationId }),
			client.wallets.listOrganizationWithdrawals({ organizationId, skip: 0, take: 50 }),
			client.wallets.getOrganizationWalletTransactions({ organizationId, skip: 0, take: 50 }),
			client.wallets.getWalletHolds({ organizationId }),
			client.wallets.getWithdrawalStats({ holderType: "organization" }),
		])

		const wallet = results[0].status === "fulfilled" ? results[0].value : null
		const withdrawals = results[1].status === "fulfilled" ? results[1].value : { data: [] }
		const transactions = results[2].status === "fulfilled" ? results[2].value : { data: [] }
		const holds = results[3].status === "fulfilled" ? results[3].value : { holds: [] }
		const stats = results[4].status === "fulfilled" ? results[4].value : null

		// Log errors for failed promises
		results.forEach((result, index) => {
			if (result.status === "rejected") {
				const names = ["wallet", "withdrawals", "transactions", "holds", "stats"]
				logSSRError(result.reason, "getWalletData", `wallet-${names[index]}`, {
					data: { organizationId },
				})
			}
		})

		return {
			balance: wallet,
			withdrawals: withdrawals.data || [],
			transactions: transactions.data || [],
			activeHolds: holds.holds || [],
			stats,
		}
	} catch (error) {
		// Handle authentication errors gracefully
		if (isAuthenticationError(error)) {
			logWarn("Authentication error in getWalletData, returning null", {
				source: "getWalletData",
				data: { errorMessage: getErrorMessageForLog(error) },
			})
			return null
		}

		logSSRError(error, "getWalletData", "wallet-data", {
			data: { organizationId },
		})
		return null
	}
}
