/**
 * Wallet Feature Types
 */

import type { wallets } from "@/lib/api/encore-client"

// Re-export from Encore client
export type Wallet = wallets.Wallet
export type WalletTransaction = wallets.WalletTransaction
export type ActiveHold = wallets.ActiveHold
export type Withdrawal = wallets.Withdrawal
export type WithdrawalStats = wallets.WithdrawalStats

// Aliases for compatibility
export type WalletBalance = Wallet
export type WalletSummary = Wallet
export type Transaction = WalletTransaction
export type WalletHold = ActiveHold
export type WalletWithdrawal = Withdrawal
export type WalletStats = WithdrawalStats

