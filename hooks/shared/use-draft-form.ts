/**
 * useDraftForm Hook
 *
 * Auto-saves form state to localStorage with debouncing.
 * Uses RHF's watch subscription for optimal performance.
 *
 * @example
 * ```tsx
 * const { watch, setValue } = useForm()
 * const { clearDraft } = useDraftForm({
 *   storageKey: 'campaign-draft',
 *   watch,
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
	storageKey: string
	watch: UseFormWatch<T>
	onRestore?: (data: T) => void
	saveDelay?: number
	enabled?: boolean
}

export function useDraftForm<T extends Record<string, unknown>>(
	options: UseDraftFormOptions<T>
) {
	const { storageKey, watch, onRestore, saveDelay = 1000, enabled = true } = options
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isRestoringRef = useRef(false)

	// Restore on mount
	useEffect(() => {
		if (!enabled || typeof window === "undefined") return
		try {
			const saved = localStorage.getItem(storageKey)
			if (saved && onRestore) {
				isRestoringRef.current = true
				onRestore(JSON.parse(saved) as T)
				setTimeout(() => { isRestoringRef.current = false }, 100)
			}
		} catch {
			localStorage.removeItem(storageKey)
		}
	}, [storageKey, onRestore, enabled])

	// Auto-save on changes
	useEffect(() => {
		if (!enabled || typeof window === "undefined") return

		const subscription = watch((value) => {
			if (isRestoringRef.current) return
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
			timeoutRef.current = setTimeout(() => {
				try { localStorage.setItem(storageKey, JSON.stringify(value)) } catch {}
			}, saveDelay)
		})

		return () => {
			subscription.unsubscribe()
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [storageKey, watch, saveDelay, enabled])

	const clearDraft = useCallback(() => {
		if (typeof window !== "undefined") localStorage.removeItem(storageKey)
	}, [storageKey])

	const hasDraft = useCallback(() => {
		if (typeof window === "undefined") return false
		return localStorage.getItem(storageKey) !== null
	}, [storageKey])

	return { clearDraft, hasDraft }
}
