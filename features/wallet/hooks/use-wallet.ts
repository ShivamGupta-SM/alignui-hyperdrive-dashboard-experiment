/**
 * Wallet React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 * URL-based multi-tenancy: organizationId from URL params
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/api/client"
import { STALE_TIME, GC_TIME, PAGE_SIZE, DEFAULT_RETRY_CONFIG, createMutationErrorHandler, createQueryKeyFactory } from "@/lib/utils/query-config"
import type { shared } from "@/brand-client"
import * as actions from "../actions/wallet"

// ============================================
// Query Keys - Using factory + custom extensions
// ============================================
const baseKeys = createQueryKeyFactory("wallet")

export const walletKeys = {
	...baseKeys,
	// Wallet-specific extended keys
	balance: (orgId: string) => [...baseKeys.all(orgId), "balance"] as const,
	transactions: (orgId: string) => [...baseKeys.all(orgId), "transactions"] as const,
	withdrawals: (orgId: string) => [...baseKeys.all(orgId), "withdrawals"] as const,
	holds: (orgId: string) => [...baseKeys.all(orgId), "holds"] as const,
	stats: (orgId: string) => [...baseKeys.all(orgId), "stats"] as const,
	depositAccount: (orgId: string) => [...baseKeys.all(orgId), "depositAccount"] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * Get wallet balance (includes depositAccount in response)
 */
export function useWallet(orgId: string) {
	return useQuery({
		queryKey: walletKeys.balance(orgId),
		queryFn: () => client.organizations.getOrganizationWallet(orgId),
		enabled: !!orgId,
		staleTime: STALE_TIME.REALTIME,
		gcTime: GC_TIME.SHORT,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get wallet transactions
 * FIX: Changed staleTime from LONG to SHORT - users expect to see recent transactions
 * FIX: Added pagination params to query key to avoid stale cache when paginating
 */
export function useWalletTransactions(orgId: string, params?: { skip?: number; take?: number }) {
	return useQuery({
		queryKey: [...walletKeys.transactions(orgId), params?.skip ?? 0, params?.take ?? PAGE_SIZE.MEDIUM] as const,
		queryFn: () =>
			client.organizations.getOrganizationWalletTransactions(orgId, {
				skip: params?.skip ?? 0,
				take: params?.take ?? PAGE_SIZE.MEDIUM,
			}),
		enabled: !!orgId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get withdrawals with optional status filter
 */
export function useWithdrawals(
	orgId: string,
	params?: { skip?: number; take?: number; status?: shared.WithdrawalStatus }
) {
	return useQuery({
		queryKey: [...walletKeys.withdrawals(orgId), params?.status ?? "all"] as const,
		queryFn: () =>
			client.organizations.listOrganizationWithdrawals(orgId, {
				skip: params?.skip ?? 0,
				take: params?.take ?? PAGE_SIZE.MEDIUM,
				status: params?.status,
			}),
		enabled: !!orgId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get wallet holds - active enrollment holds
 */
export function useWalletHolds(orgId: string) {
	return useQuery({
		queryKey: walletKeys.holds(orgId),
		queryFn: () => client.organizations.getWalletHolds(orgId),
		enabled: !!orgId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get deposit account details for funding wallet
 */
export function useDepositAccount(orgId: string) {
	return useQuery({
		queryKey: walletKeys.depositAccount(orgId),
		queryFn: () => client.organizations.getDepositAccount(orgId),
		enabled: !!orgId,
		staleTime: STALE_TIME.LONG,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

// ============================================
// MUTATIONS - Via Server Actions
// All mutations pass organizationId for URL-based multi-tenancy
// ============================================

/**
 * Request withdrawal
 */
export function useRequestWithdrawal(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ amount, notes }: { amount: number; notes?: string }) =>
			actions.requestWithdrawal({ organizationId: orgId, amount, notes }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: walletKeys.balance(orgId) })
			qc.invalidateQueries({ queryKey: walletKeys.withdrawals(orgId) })
		},
		onError: createMutationErrorHandler("request withdrawal"),
	})
}

/**
 * Request credit increase
 */
export function useRequestCredit(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ amount, reason }: { amount: number; reason?: string }) =>
			actions.requestCredit({ organizationId: orgId, amount, reason }),
		onSuccess: () => qc.invalidateQueries({ queryKey: walletKeys.balance(orgId) }),
		onError: createMutationErrorHandler("request credit"),
	})
}

/**
 * Fund organization wallet (admin/internal use)
 * Adds funds to the organization's wallet balance
 */
export function useFundWallet(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: { amount: number; reason: string; reference: string }) =>
			client.organizations.fundOrganizationWallet(orgId, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: walletKeys.balance(orgId) })
			qc.invalidateQueries({ queryKey: walletKeys.transactions(orgId) })
		},
		onError: createMutationErrorHandler("fund wallet"),
	})
}

// Types are exported from @/features/wallet (feature index)
