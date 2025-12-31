/**
 * Wallet Feature Types
 *
 * @description
 * Single source of truth for all wallet-related types.
 * Note: Most wallet types are in 'organizations' namespace in brand client
 */

import type { organizations, wallets, shared } from "@/brand-client"
import type { BaseFilters } from "@/lib/types/base"

// Re-export from Encore client - wallet types are in organizations namespace
// Note: SSR uses client.organizations.* methods which return organizations.* types
export type OrganizationWallet = organizations.OrganizationWalletResponse
export type WalletTransaction = organizations.WalletTransaction
export type ActiveHold = organizations.ActiveHold
export type Withdrawal = organizations.Withdrawal
export type WithdrawalStatus = shared.WithdrawalStatus
export type WithdrawalStats = wallets.WithdrawalStats // Only exists in wallets namespace

// SSOT: Import DepositAccountDetails from organizations module (primary owner)
export type { DepositAccountDetails } from "@/features/organizations/types"

// Request types - from wallets namespace
export type AddWithdrawalMethodRequest = wallets.AddWithdrawalMethodRequest
export type CreateWithdrawalRequest = wallets.CreateWithdrawalRequest

// Response types - from organizations namespace
export type FundWalletResponse = organizations.FundWalletResponse

// Transaction type from API (derived from WalletTransaction.type)
export type TransactionType = WalletTransaction["type"]

// Note: Use canonical types directly (OrganizationWallet, WalletTransaction, ActiveHold, Withdrawal)
// Deprecated aliases have been removed for SSOT compliance

// Feature-specific types
export interface WalletFilters extends BaseFilters {
	type?: "credit" | "debit" | "hold" | "release"
}

export interface WalletOverview {
	balance: number
	balanceDecimal: string
	pendingBalance: number
	pendingBalanceDecimal: string
	availableBalance: number
	availableBalanceDecimal: string
	creditLimit?: number
	creditLimitDecimal?: string
	creditUtilized?: number
	creditUtilizedDecimal?: string
	currency: string
}
