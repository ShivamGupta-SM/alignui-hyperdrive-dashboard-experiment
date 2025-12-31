/**
 * Wallet Feature - Public API
 */

// Types
export type * from "./types"

// Hooks
export {
	// Query Keys
	walletKeys,
	// Queries
	useWallet,
	useWalletTransactions,
	useWithdrawals,
	useWalletHolds,
	useDepositAccount,
	// Mutations
	useRequestWithdrawal,
	useRequestCredit,
	useFundWallet,
} from "./hooks/use-wallet"

// Server Actions
export { requestWithdrawal, requestCredit } from "./actions/wallet"

// SSR Data Fetching - Import directly from @/features/wallet/ssr in server components
