/**
 * Wallet React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import { STALE_TIME } from "@/lib/utils/query-config"
import * as actions from "../actions/wallet"

// ============================================
// Client Instance
// ============================================
const client = getEncoreBrowserClient()

// ============================================
// Query Keys
// ============================================
export const walletKeys = {
	all: (orgId: string) => ["wallet", orgId] as const,
	balance: (orgId: string) => [...walletKeys.all(orgId), "balance"] as const,
	transactions: (orgId: string) => [...walletKeys.all(orgId), "transactions"] as const,
	withdrawals: (orgId: string) => [...walletKeys.all(orgId), "withdrawals"] as const,
	holds: (orgId: string) => [...walletKeys.all(orgId), "holds"] as const,
	stats: (orgId: string) => [...walletKeys.all(orgId), "stats"] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * Get wallet balance
 */
export function useWallet(orgId: string) {
	return useQuery({
		queryKey: walletKeys.balance(orgId),
		queryFn: () => client.wallets.getOrganizationWallet({ organizationId: orgId }),
		enabled: !!orgId,
		staleTime: STALE_TIME.REALTIME,
	})
}

/**
 * Get wallet transactions
 */
export function useWalletTransactions(orgId: string, params?: { skip?: number; take?: number }) {
	return useQuery({
		queryKey: walletKeys.transactions(orgId),
		queryFn: () =>
			client.wallets.getOrganizationWalletTransactions({
				organizationId: orgId,
				skip: params?.skip ?? 0,
				take: params?.take ?? 50,
			}),
		enabled: !!orgId,
	})
}

/**
 * Get withdrawals
 */
export function useWithdrawals(orgId: string, params?: { skip?: number; take?: number }) {
	return useQuery({
		queryKey: walletKeys.withdrawals(orgId),
		queryFn: () =>
			client.wallets.listOrganizationWithdrawals({
				organizationId: orgId,
				skip: params?.skip ?? 0,
				take: params?.take ?? 50,
			}),
		enabled: !!orgId,
	})
}

/**
 * Get wallet holds
 */
export function useWalletHolds(orgId: string) {
	return useQuery({
		queryKey: walletKeys.holds(orgId),
		queryFn: () => client.wallets.getWalletHolds({ organizationId: orgId }),
		enabled: !!orgId,
	})
}

/**
 * Get withdrawal stats
 */
export function useWithdrawalStats() {
	return useQuery({
		queryKey: ["withdrawal-stats"],
		queryFn: () => client.wallets.getWithdrawalStats({ holderType: "organization" }),
	})
}

// ============================================
// MUTATIONS - Via Server Actions
// ============================================

/**
 * Request withdrawal
 */
export function useRequestWithdrawal(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: actions.requestWithdrawal,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: walletKeys.balance(orgId) })
			qc.invalidateQueries({ queryKey: walletKeys.withdrawals(orgId) })
		},
	})
}

/**
 * Cancel withdrawal (direct client - no SSR cache needed)
 */
export function useCancelWithdrawal(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (withdrawalId: string) => client.wallets.cancelWithdrawal(withdrawalId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: walletKeys.balance(orgId) })
			qc.invalidateQueries({ queryKey: walletKeys.withdrawals(orgId) })
		},
	})
}

/**
 * Request credit increase
 */
export function useRequestCredit(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: actions.requestCredit,
		onSuccess: () => qc.invalidateQueries({ queryKey: walletKeys.balance(orgId) }),
	})
}

// Re-export types
export type * from "../types"
