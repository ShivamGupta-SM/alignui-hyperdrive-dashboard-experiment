"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useCopyToClipboard as useClipboardBase } from "usehooks-ts"

const DEFAULT_TIMEOUT = 2000

export interface UseClipboardOptions {
	/** Duration in ms before resetting copied state (default: 2000) */
	timeout?: number
	/** Callback when copy succeeds */
	onSuccess?: (text: string) => void
	/** Callback when copy fails */
	onError?: (error: Error) => void
}

/**
 * Clipboard hook with timeout-based reset and field tracking.
 * Built on usehooks-ts useCopyToClipboard.
 *
 * @example Simple usage
 * const { copy, copied } = useCopyToClipboard()
 *
 * @example Field-based usage
 * const { copy, isCopied } = useCopyToClipboard<'account' | 'ifsc'>()
 * <button onClick={() => copy(text, 'account')}>{isCopied('account') ? '✓' : 'Copy'}</button>
 */
export function useCopyToClipboard<T extends string = string>(options: UseClipboardOptions = {}) {
	const { timeout = DEFAULT_TIMEOUT, onSuccess, onError } = options

	const [, copyToClipboard] = useClipboardBase()
	const [copiedField, setCopiedField] = useState<T | null>(null)
	const [error, setError] = useState<Error | null>(null)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	const copy = useCallback(
		async (text: string, field?: T) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = null
			}

			try {
				const success = await copyToClipboard(text)
				if (success) {
					setCopiedField((field ?? "__copied__") as T)
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
		copied: copiedField !== null,
		copiedField,
		isCopied: (field: T) => copiedField === field,
		error,
		reset,
	}
}

// Backwards compatibility
export const useCopyWithField = useCopyToClipboard
