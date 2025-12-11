'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { wallets } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'
import { walletKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { walletKeys }

// ============================================
// Types - Re-export from Encore client for convenience
// ============================================

export type Wallet = wallets.Wallet
export type WalletTransaction = wallets.WalletTransaction
export type ActiveHold = wallets.ActiveHold
export type Withdrawal = wallets.Withdrawal
export type WithdrawalStats = wallets.WithdrawalStats

// Legacy type aliases for backwards compatibility
export type WalletBalance = Wallet
export type WalletSummary = Wallet
export type Transaction = WalletTransaction

// ============================================
// Types
// ============================================

interface TransactionFilters {
  type?: string
  page?: number
  limit?: number
  [key: string]: string | number | undefined
}

interface WithdrawalData {
  amount: number
  notes?: string
}

// ============================================
// Query Hooks
// ============================================

export function useWalletSummary(organizationId?: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: walletKeys.summary(),
    queryFn: () => {
      const orgId = organizationId || 'default'
      return client.wallets.getOrganizationWallet(orgId)
    },
    staleTime: STALE_TIMES.REALTIME, // 30 seconds - wallet data changes frequently
  })
}

export function useTransactions(organizationId?: string, filters: TransactionFilters = {}) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: walletKeys.transactionList(filters),
    queryFn: () => {
      const orgId = organizationId || 'default'
      return client.wallets.getOrganizationWalletTransactions(orgId, {
        skip: filters.page ? (filters.page - 1) * (filters.limit || 20) : 0,
        take: filters.limit || 20,
      })
    },
    staleTime: STALE_TIMES.REALTIME,
  })
}

// ============================================
// Mutation Hooks
// ============================================

export function useRequestWithdrawal(organizationId?: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: WithdrawalData) => {
      const orgId = organizationId || 'default'
      return client.wallets.createOrganizationWithdrawal(orgId, {
        amount: data.amount,
        notes: data.notes,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all })
    },
  })
}

// ============================================
// SSR Hydration Hook
// ============================================

/**
 * Fetch wallet data for SSR hydration
 * Used by the wallet page to hydrate React Query cache
 */
export function useWalletData(organizationId?: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: walletKeys.data(),
    queryFn: async () => {
      const orgId = organizationId || 'default'
      const [wallet, transactions, holds] = await Promise.all([
        client.wallets.getOrganizationWallet(orgId),
        client.wallets.getOrganizationWalletTransactions(orgId, { take: 20 }),
        client.wallets.getWalletHolds(orgId),
      ])
      return {
        wallet,
        transactions: transactions.data,
        activeHolds: holds.holds,
      }
    },
    staleTime: STALE_TIMES.REALTIME,
  })
}

// ============================================
// Withdrawal History Hooks
// ============================================

interface WithdrawalFilters {
  status?: string
  page?: number
  limit?: number
  [key: string]: string | number | undefined
}

/**
 * Fetch withdrawal history for the organization
 */
export function useWithdrawals(organizationId?: string, filters: WithdrawalFilters = {}) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...walletKeys.all, 'withdrawals', filters] as const,
    queryFn: async () => {
      const orgId = organizationId || 'default'
      const result = await client.wallets.listOrganizationWithdrawals(orgId, {
        skip: filters.page ? (filters.page - 1) * (filters.limit || 20) : 0,
        take: filters.limit || 20,
      })
      return {
        withdrawals: result.data,
        total: result.total,
        page: filters.page || 1,
        limit: filters.limit || 20,
      }
    },
    staleTime: STALE_TIMES.REALTIME,
  })
}

/**
 * Fetch single withdrawal details
 */
export function useWithdrawal(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...walletKeys.all, 'withdrawal', id] as const,
    queryFn: () => client.wallets.getWithdrawal(id),
    enabled: !!id,
    staleTime: STALE_TIMES.REALTIME,
  })
}

/**
 * Cancel a pending withdrawal
 */
export function useCancelWithdrawal() {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (id: string) => client.wallets.cancelWithdrawal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all })
    },
  })
}

// ============================================
// Withdrawal Stats Hook
// ============================================

/**
 * Fetch withdrawal statistics for the organization
 */
export function useWithdrawalStats(holderType: 'organization' | 'shopper' = 'organization', holderId?: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...walletKeys.all, 'withdrawal-stats', holderType, holderId] as const,
    queryFn: () => client.wallets.getWithdrawalStats({
      holderId: holderId || 'default',
      holderType,
    }),
    staleTime: STALE_TIMES.STANDARD,
  })
}
