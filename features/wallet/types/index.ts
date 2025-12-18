/**
 * Wallet Feature Types
 */

import type { wallets } from "@/lib/api/encore-client"

// Re-export from Encore client - using the correct type names
export type OrganizationWallet = wallets.OrganizationWalletResponse
export type ShopperWallet = wallets.ShopperWalletResponse
export type WalletTransaction = wallets.WalletTransaction
export type ActiveHold = wallets.ActiveHold
export type Withdrawal = wallets.Withdrawal
export type WithdrawalStats = wallets.WithdrawalStats

// Aliases for compatibility with old code
export type Wallet = OrganizationWallet
export type WalletBalance = OrganizationWallet
export type WalletSummary = OrganizationWallet
export type Transaction = WalletTransaction
export type WalletHold = ActiveHold
export type WalletWithdrawal = Withdrawal
export type WalletStats = WithdrawalStats

