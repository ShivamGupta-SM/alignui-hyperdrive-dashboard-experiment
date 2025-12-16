/**
 * Wallet Query Keys Factory
 */

export const walletQueryKeys = {
	all: ['wallet'] as const,
	balance: () => [...walletQueryKeys.all, 'balance'] as const,
	transactions: () => [...walletQueryKeys.all, 'transactions'] as const,
	withdrawals: () => [...walletQueryKeys.all, 'withdrawals'] as const,
	holds: () => [...walletQueryKeys.all, 'holds'] as const,
	stats: () => [...walletQueryKeys.all, 'stats'] as const,
} as const

