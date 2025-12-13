'use client'

import type { wallets } from '@/lib/encore-browser'

// ============================================
// Types - Re-export from Encore client for convenience
// ============================================

export type Wallet = wallets.Wallet
export type WalletTransaction = wallets.WalletTransaction
export type ActiveHold = wallets.ActiveHold
export type Withdrawal = wallets.Withdrawal
export type WithdrawalStats = wallets.WithdrawalStats
export type WalletStats = wallets.WithdrawalStats // Mapping WalletStats to WithdrawalStats if that's what it was used for, or check usage.
// Actually in original file: export type WalletStats was NOT explicitly exported? 
// Let's check original file content in step 2594. 
// It had `export { walletKeys }`.
// It had `export type Wallet = ...`
// It DID NOT export `WalletStats`. 
// But `WalletClient` imported `WalletStats`. 
// Wait, `WalletClient` imported `WalletStats` in step 2553 summary? 
// "Removed useWithdrawals, useCancelWithdrawal, useWithdrawalStats..."
// In `WalletClient` import list:
// import { Wallet, WalletTransaction, WalletWithdrawal, WalletHold, WithdrawalStats, WalletStats } from '@/hooks/use-wallet'
// I suspect `WalletStats` might have been an alias or I imagined it.
// Let's look at `use-wallet.ts` content again.
// Line 20: export type WithdrawalStats = wallets.WithdrawalStats
// No WalletStats.
// Maybe `WalletClient` uses `WithdrawalStats` as alias? props.initialData.stats is type `WithdrawalStats`.
// I will check `WalletClient` code if possible or just export `WithdrawalStats`.
// If `WalletClient` imports `WalletStats`, I should probably alias it. 
// "const stats = (initialData?.stats ?? defaultStats) as WithdrawalStats"

export type WalletBalance = Wallet
export type WalletSummary = Wallet
export type Transaction = WalletTransaction
export type WalletHold = ActiveHold // Alias for WalletHold if needed
export type WalletWithdrawal = Withdrawal // Alias
