"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useCopyToClipboard as useClipboard } from "usehooks-ts"
import { DURATIONS } from "@/lib/types/constants"

export interface UseClipboardOptions {
	/** Duration in ms before resetting copied state (default: DURATIONS.CLIPBOARD_FEEDBACK_MS) */
	timeout?: number
	/** Callback when copy succeeds */
	onSuccess?: (text: string) => void
	/** Callback when copy fails */
	onError?: (error: Error) => void
}

/**
 * Hook for copying text to clipboard with visual feedback state.
 *
 * @example
 * ```tsx
 * function CopyButton({ text }: { text: string }) {
 *   const { copy, copied, error } = useCopyToClipboard()
 *
 *   return (
 *     <button onClick={() => copy(text)}>
 *       {copied ? <Check /> : <Copy />}
 *       {copied ? 'Copied!' : 'Copy'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useCopyToClipboard(options: UseClipboardOptions = {}) {
	const { timeout = DURATIONS.CLIPBOARD_FEEDBACK_MS, onSuccess, onError } = options

	const [_, copyToClipboard] = useClipboard()
	const [copied, setCopied] = useState(false)
	const [error, setError] = useState<Error | null>(null)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	const copy = useCallback(
		async (text: string) => {
			try {
				// Clear any existing timeout
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current)
					timeoutRef.current = null
				}

				const success = await copyToClipboard(text)

				if (success) {
					setCopied(true)
					setError(null)
					onSuccess?.(text)

					// Reset after timeout
					timeoutRef.current = setTimeout(() => {
						setCopied(false)
						timeoutRef.current = null
					}, timeout)
				} else {
					throw new Error("Failed to copy to clipboard")
				}
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Unknown error")
				setError(error)
				onError?.(error)
			}
		},
		[copyToClipboard, timeout, onSuccess, onError]
	)

	const reset = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
		setCopied(false)
		setError(null)
	}, [])

	return {
		copy,
		copied,
		error,
		reset,
	}
}

/**
 * Hook for copying with a specific field identifier.
 * Useful when you have multiple copy buttons and need to track which one was clicked.
 *
 * @example
 * ```tsx
 * function BankDetails() {
 *   const { copy, copiedField } = useCopyWithField()
 *
 *   return (
 *     <div>
 *       <span>{accountNumber}</span>
 *       <button onClick={() => copy(accountNumber, 'account')}>
 *         {copiedField === 'account' ? 'Copied!' : 'Copy'}
 *       </button>
 *
 *       <span>{ifscCode}</span>
 *       <button onClick={() => copy(ifscCode, 'ifsc')}>
 *         {copiedField === 'ifsc' ? 'Copied!' : 'Copy'}
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useCopyWithField<T extends string = string>(options: UseClipboardOptions = {}) {
	const { timeout = DURATIONS.CLIPBOARD_FEEDBACK_MS, onSuccess, onError } = options

	const [_, copyToClipboard] = useClipboard()
	const [copiedField, setCopiedField] = useState<T | null>(null)
	const [error, setError] = useState<Error | null>(null)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	const copy = useCallback(
		async (text: string, field: T) => {
			try {
				// Clear any existing timeout
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current)
					timeoutRef.current = null
				}

				const success = await copyToClipboard(text)

				if (success) {
					setCopiedField(field)
					setError(null)
					onSuccess?.(text)

					timeoutRef.current = setTimeout(() => {
						setCopiedField(null)
						timeoutRef.current = null
					}, timeout)
				} else {
					throw new Error("Failed to copy to clipboard")
				}
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Unknown error")
				setError(error)
				onError?.(error)
			}
		},
		[copyToClipboard, timeout, onSuccess, onError]
	)

	const reset = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
		setCopiedField(null)
		setError(null)
	}, [])

	return {
		copy,
		copiedField,
		isCopied: (field: T) => copiedField === field,
		error,
		reset,
	}
}
