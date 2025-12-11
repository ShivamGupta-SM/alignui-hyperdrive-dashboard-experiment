'use client'

import { useState, useCallback } from 'react'
import { useCopyToClipboard as useClipboard } from 'usehooks-ts'
import { DURATIONS } from '@/lib/types/constants'

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

  const copy = useCallback(
    async (text: string) => {
      try {
        const success = await copyToClipboard(text)

        if (success) {
          setCopied(true)
          setError(null)
          onSuccess?.(text)

          // Reset after timeout
          setTimeout(() => {
            setCopied(false)
          }, timeout)
        } else {
          throw new Error('Failed to copy to clipboard')
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        onError?.(error)
      }
    },
    [copyToClipboard, timeout, onSuccess, onError]
  )

  const reset = useCallback(() => {
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
export function useCopyWithField<T extends string = string>(
  options: UseClipboardOptions = {}
) {
  const { timeout = DURATIONS.CLIPBOARD_FEEDBACK_MS, onSuccess, onError } = options

  const [_, copyToClipboard] = useClipboard()
  const [copiedField, setCopiedField] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const copy = useCallback(
    async (text: string, field: T) => {
      try {
        const success = await copyToClipboard(text)

        if (success) {
          setCopiedField(field)
          setError(null)
          onSuccess?.(text)

          setTimeout(() => {
            setCopiedField(null)
          }, timeout)
        } else {
          throw new Error('Failed to copy to clipboard')
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        onError?.(error)
      }
    },
    [copyToClipboard, timeout, onSuccess, onError]
  )

  const reset = useCallback(() => {
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
