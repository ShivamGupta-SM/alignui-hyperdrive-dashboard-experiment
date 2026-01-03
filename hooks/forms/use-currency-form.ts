"use client"

/**
 * useCurrencyForm - Shared hook for currency input forms
 *
 * ✅ FIX Bug 22 & 27: Extracts duplicated currency input logic
 * Used by: AddFundsModal, WithdrawalModal, CreditLimitModal
 *
 * @example
 * ```tsx
 * const { amount, setAmount, isValidAmount, quickAmounts, selectQuickAmount } = useCurrencyForm({
 *   minAmount: 1000,
 *   maxAmount: availableBalance,
 *   quickAmounts: [10000, 25000, 50000],
 * })
 * ```
 */

import { useState, useMemo, useCallback } from "react"

interface UseCurrencyFormOptions {
	/** Minimum allowed amount (default: 0) */
	minAmount?: number
	/** Maximum allowed amount (optional) */
	maxAmount?: number
	/** Quick select amounts (default: [10000, 25000, 50000, 100000]) */
	quickAmounts?: number[]
	/** Initial amount value */
	initialAmount?: string
}

interface UseCurrencyFormReturn {
	/** Current amount as string (for input binding) */
	amount: string
	/** Set amount value */
	setAmount: (value: string) => void
	/** Amount as number (0 if invalid) */
	amountNumber: number
	/** Whether current amount is valid */
	isValidAmount: boolean
	/** Validation error message (if any) */
	errorMessage: string | null
	/** Quick select amounts */
	quickAmounts: number[]
	/** Select a quick amount */
	selectQuickAmount: (value: number) => void
	/** Reset form to initial state */
	reset: () => void
}

export function useCurrencyForm(options: UseCurrencyFormOptions = {}): UseCurrencyFormReturn {
	const {
		minAmount = 0,
		maxAmount,
		quickAmounts: customQuickAmounts,
		initialAmount = "",
	} = options

	const [amount, setAmount] = useState(initialAmount)

	const quickAmounts = useMemo(
		() => customQuickAmounts ?? [10000, 25000, 50000, 100000],
		[customQuickAmounts]
	)

	const amountNumber = useMemo(() => {
		const parsed = Number(amount)
		return isNaN(parsed) ? 0 : parsed
	}, [amount])

	const { isValidAmount, errorMessage } = useMemo(() => {
		if (!amount || amount === "") {
			return { isValidAmount: false, errorMessage: null }
		}

		const num = amountNumber

		if (isNaN(num) || num <= 0) {
			return { isValidAmount: false, errorMessage: "Please enter a valid amount" }
		}

		if (num < minAmount) {
			return {
				isValidAmount: false,
				errorMessage: `Minimum amount is ₹${minAmount.toLocaleString("en-IN")}`,
			}
		}

		if (maxAmount !== undefined && num > maxAmount) {
			return {
				isValidAmount: false,
				errorMessage: `Maximum amount is ₹${maxAmount.toLocaleString("en-IN")}`,
			}
		}

		return { isValidAmount: true, errorMessage: null }
	}, [amount, amountNumber, minAmount, maxAmount])

	const selectQuickAmount = useCallback((value: number) => {
		setAmount(value.toString())
	}, [])

	const reset = useCallback(() => {
		setAmount(initialAmount)
	}, [initialAmount])

	return {
		amount,
		setAmount,
		amountNumber,
		isValidAmount,
		errorMessage,
		quickAmounts,
		selectQuickAmount,
		reset,
	}
}

export type { UseCurrencyFormOptions, UseCurrencyFormReturn }
