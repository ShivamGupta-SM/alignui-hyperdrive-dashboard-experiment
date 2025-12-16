/**
 * Wallet API - Single source of truth for all wallet operations
 */

import { getEncoreBrowserClient } from "@/lib/api/encore-browser"

/**
 * Get organization wallet
 * 
 * @description
 * Gets the wallet for the active organization (uses activeOrganizationId from session automatically)
 * 
 * @returns Wallet data
 */
export async function getWallet() {
	const client = getEncoreBrowserClient()
	return client.wallets.getOrganizationWallet()
}

/**
 * Create withdrawal request
 * 
 * @param organizationId - Organization ID
 * @param data - Withdrawal data (amount, notes)
 * @returns Created withdrawal
 */
export async function createWithdrawal(
	organizationId: string,
	data: {
		amount: number
		notes?: string
	}
) {
	const client = getEncoreBrowserClient()
	return client.wallets.createOrganizationWithdrawal(organizationId, data)
}

/**
 * Cancel withdrawal request
 * 
 * @param withdrawalId - Withdrawal ID
 */
export async function cancelWithdrawal(withdrawalId: string) {
	const client = getEncoreBrowserClient()
	return client.wallets.cancelWithdrawal(withdrawalId)
}

