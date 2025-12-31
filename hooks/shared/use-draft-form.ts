/**
 * useDraftForm Hook
 *
 * @description
 * Centralized draft form persistence hook.
 * Auto-saves form state to localStorage with debouncing.
 * Uses RHF's watch subscription (not polling) for optimal performance.
 *
 * @example
 * ```tsx
 * const { watch, setValue } = useForm()
 * useDraftForm({
 *   storageKey: 'campaign-draft',
 *   watch, // Pass watch function - hook subscribes to changes
 *   onRestore: (data) => {
 *     Object.entries(data).forEach(([key, value]) => setValue(key, value))
 *   }
 * })
 * ```
 */

"use client"

import { useEffect, useRef, useCallback } from "react"
import type { UseFormWatch } from "react-hook-form"

export interface UseDraftFormOptions<T extends Record<string, unknown>> {
	/** Unique storage key for this form */
	storageKey: string
	/** Watch function from react-hook-form - subscribes to form changes */
	watch: UseFormWatch<T>
	/** Callback when restoring draft data */
	onRestore?: (data: T) => void
	/** Debounce delay for saving (default: 1000ms) */
	saveDelay?: number
	/** Whether auto-save is enabled (default: true) */
	enabled?: boolean
}

export interface UseDraftFormReturn {
	/** Manually save current form state */
	saveDraft: () => void
	/** Clear saved draft */
	clearDraft: () => void
	/** Check if draft exists */
	hasDraft: () => boolean
	/** Get draft data without restoring */
	getDraft: () => unknown | null
}

/**
 * Hook for auto-saving form drafts to localStorage
 * Uses RHF watch subscription instead of polling for better performance
 */
export function useDraftForm<T extends Record<string, unknown>>(
	options: UseDraftFormOptions<T>
): UseDraftFormReturn {
	const { storageKey, watch, onRestore, saveDelay = 1000, enabled = true } = options

	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isRestoringRef = useRef(false)

	// Restore draft on mount
	useEffect(() => {
		if (!enabled || typeof window === "undefined") return

		let restoreTimeoutId: ReturnType<typeof setTimeout> | null = null

		try {
			const saved = localStorage.getItem(storageKey)
			if (saved && onRestore) {
				const data = JSON.parse(saved) as T
				isRestoringRef.current = true
				onRestore(data)
				// Reset flag after a tick to allow normal saves
				restoreTimeoutId = setTimeout(() => {
					isRestoringRef.current = false
				}, 100)
			}
		} catch {
			// Ignore parse errors - draft may be corrupted
			localStorage.removeItem(storageKey)
		}

		// Cleanup timeout on unmount to prevent memory leaks
		return () => {
			if (restoreTimeoutId) {
				clearTimeout(restoreTimeoutId)
			}
		}
	}, [storageKey, onRestore, enabled])

	// ✅ FIX: Use RHF watch subscription instead of setInterval polling
	// react-hook-form's watch() accepts a callback for subscription
	useEffect(() => {
		if (!enabled || typeof window === "undefined") return

		// Subscribe to form changes using RHF's watch callback
		const subscription = watch((value) => {
			// Skip if we're restoring data
			if (isRestoringRef.current) return

			// Debounce saves
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}

			timeoutRef.current = setTimeout(() => {
				try {
					localStorage.setItem(storageKey, JSON.stringify(value))
				} catch {
					// Ignore storage errors (quota exceeded, etc.)
				}
			}, saveDelay)
		})

		// Cleanup subscription and timeout on unmount
		return () => {
			subscription.unsubscribe()
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [storageKey, watch, saveDelay, enabled])

	const saveDraft = useCallback(() => {
		if (typeof window === "undefined") return
		try {
			// Get current form values using watch with no args
			const currentValue = watch()
			localStorage.setItem(storageKey, JSON.stringify(currentValue))
		} catch {
			// Ignore storage errors
		}
	}, [storageKey, watch])

	const clearDraft = useCallback(() => {
		if (typeof window === "undefined") return
		localStorage.removeItem(storageKey)
	}, [storageKey])

	const hasDraft = useCallback(() => {
		if (typeof window === "undefined") return false
		return localStorage.getItem(storageKey) !== null
	}, [storageKey])

	const getDraft = useCallback(() => {
		if (typeof window === "undefined") return null
		try {
			const saved = localStorage.getItem(storageKey)
			return saved ? JSON.parse(saved) : null
		} catch {
			return null
		}
	}, [storageKey])

	return {
		saveDraft,
		clearDraft,
		hasDraft,
		getDraft,
	}
}

/**
 * Simple hook to restore and clear draft without auto-save
 * For forms that only need manual save/restore
 */
export function useDraftRestore<T>(storageKey: string): {
	draft: T | null
	clearDraft: () => void
	saveDraft: (data: T) => void
} {
	const getDraft = useCallback((): T | null => {
		if (typeof window === "undefined") return null
		try {
			const saved = localStorage.getItem(storageKey)
			return saved ? JSON.parse(saved) : null
		} catch {
			return null
		}
	}, [storageKey])

	const clearDraft = useCallback(() => {
		if (typeof window === "undefined") return
		localStorage.removeItem(storageKey)
	}, [storageKey])

	const saveDraft = useCallback(
		(data: T) => {
			if (typeof window === "undefined") return
			try {
				localStorage.setItem(storageKey, JSON.stringify(data))
			} catch {
				// Ignore storage errors
			}
		},
		[storageKey]
	)

	return {
		draft: getDraft(),
		clearDraft,
		saveDraft,
	}
}
