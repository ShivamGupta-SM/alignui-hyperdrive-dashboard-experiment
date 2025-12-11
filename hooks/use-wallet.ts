'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { Transaction, ApiResponse, PaginatedResponse, WalletSummary, ApiError, WalletBalance, ActiveHold } from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'
import { walletKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { walletKeys }

// Retry configuration - don't retry on 4xx errors
const shouldRetry = (failureCount: number, error: AxiosError<ApiError>) => {
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false
  }
  return failureCount < 3
}

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
  bankAccountId: string
}

interface AddFundsData {
  amount: number
  paymentMethod: 'upi' | 'netbanking' | 'card'
}

// ============================================
// Query Hooks
// ============================================

export function useWalletSummary() {
  return useQuery({
    queryKey: walletKeys.summary(),
    queryFn: () => get<ApiResponse<WalletSummary>>('/api/wallet'),
    staleTime: STALE_TIMES.REALTIME, // 30 seconds - wallet data changes frequently
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: walletKeys.transactionList(filters),
    queryFn: () => get<PaginatedResponse<Transaction>>('/api/wallet/transactions', { params: filters }),
    staleTime: STALE_TIMES.REALTIME,
    retry: shouldRetry,
  })
}

// ============================================
// Mutation Hooks
// ============================================

export function useRequestWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: WithdrawalData) =>
      post<ApiResponse<{ withdrawalId: string; message: string }>>('/api/wallet/withdraw', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all })
    },
  })
}

export function useAddFunds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddFundsData) =>
      post<ApiResponse<{ orderId: string; paymentUrl: string }>>('/api/wallet/add-funds', data),
    onSuccess: () => {
      // Will be invalidated after payment confirmation
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
export function useWalletData() {
  return useQuery({
    queryKey: walletKeys.data(),
    queryFn: async () => {
      const response = await get<ApiResponse<{
        wallet: WalletBalance
        transactions: Transaction[]
        activeHolds: ActiveHold[]
      }>>('/api/wallet/data')
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
    staleTime: STALE_TIMES.REALTIME,
    retry: shouldRetry,
  })
}

// ============================================
// Withdrawal History Hooks
// ============================================

export interface Withdrawal {
  id: string
  organizationId: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  bankAccountId: string
  bankAccountName: string
  bankAccountLast4: string
  requestedAt: string
  processedAt: string | null
  completedAt: string | null
  failureReason: string | null
  referenceNumber: string | null
}

interface WithdrawalFilters {
  status?: string
  page?: number
  limit?: number
  [key: string]: string | number | undefined
}

/**
 * Fetch withdrawal history for the organization
 */
export function useWithdrawals(filters: WithdrawalFilters = {}) {
  return useQuery({
    queryKey: [...walletKeys.all, 'withdrawals', filters] as const,
    queryFn: () => get<ApiResponse<{
      withdrawals: Withdrawal[]
      total: number
      page: number
      limit: number
    }>>('/api/wallet/withdrawals', { params: filters }),
    staleTime: STALE_TIMES.REALTIME,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

/**
 * Fetch single withdrawal details
 */
export function useWithdrawal(id: string) {
  return useQuery({
    queryKey: [...walletKeys.all, 'withdrawal', id] as const,
    queryFn: () => get<ApiResponse<Withdrawal>>(`/api/wallet/withdrawals/${id}`),
    enabled: !!id,
    staleTime: STALE_TIMES.REALTIME,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

/**
 * Cancel a pending withdrawal
 */
export function useCancelWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      post<ApiResponse<{ id: string; status: string; message: string }>>(`/api/wallet/withdrawals/${id}/cancel`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all })
    },
  })
}

// ============================================
// Withdrawal Stats Hook
// ============================================

export interface WithdrawalStats {
  totalWithdrawals: number
  totalAmount: number
  pendingCount: number
  pendingAmount: number
  processingCount: number
  processingAmount: number
  completedCount: number
  completedAmount: number
  failedCount: number
  failedAmount: number
  cancelledCount: number
  cancelledAmount: number
  // Time-based stats
  thisMonthCount: number
  thisMonthAmount: number
  lastMonthCount: number
  lastMonthAmount: number
  // Average stats
  averageWithdrawalAmount: number
  averageProcessingTime: number // hours
  // Success rate
  successRate: number // percentage
}

/**
 * Fetch withdrawal statistics for the organization
 */
export function useWithdrawalStats(holderType: 'organization' | 'shopper' = 'organization', holderId?: string) {
  return useQuery({
    queryKey: [...walletKeys.all, 'withdrawal-stats', holderType, holderId] as const,
    queryFn: () => get<ApiResponse<WithdrawalStats>>('/api/wallet/withdrawals/stats', {
      params: { holderType, holderId }
    }),
    staleTime: STALE_TIMES.STANDARD,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}
