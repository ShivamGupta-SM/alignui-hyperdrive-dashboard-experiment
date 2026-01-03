/**
 * useDebounceSearch Hook
 *
 * @description
 * Centralized debounce search hook for consistent search behavior.
 * Uses usehooks-ts for the core debounce logic.
 *
 * @example
 * ```tsx
 * const { query, debouncedQuery, setQuery, clearQuery, isSearchActive } = useDebounceSearch()
 * ```
 */

"use client"

import { useState, useCallback, useMemo } from "react"
import { useDebounceValue } from "usehooks-ts"

export interface UseDebounceSearchOptions {
	/** Initial search query */
	initialQuery?: string
	/** Debounce delay in milliseconds (default: 300) */
	delay?: number
	/** Minimum query length to be considered active (default: 2) */
	minLength?: number
}

export interface UseDebounceSearchReturn {
	/** Current search query (immediate) */
	query: string
	/** Debounced search query */
	debouncedQuery: string
	/** Update search query */
	setQuery: (query: string) => void
	/** Clear search query */
	clearQuery: () => void
	/** Whether search is active (debouncedQuery >= minLength) */
	isSearchActive: boolean
	/** Whether query is being debounced */
	isDebouncing: boolean
}

/**
 * Hook for debounced search with consistent behavior across all pages
 */
export function useDebounceSearch(options: UseDebounceSearchOptions = {}): UseDebounceSearchReturn {
	const { initialQuery = "", delay = 300, minLength = 2 } = options

	const [query, setQueryState] = useState(initialQuery)
	const [debouncedQuery] = useDebounceValue(query, delay)

	// Check if currently debouncing (query differs from debounced value)
	const isDebouncing = query !== debouncedQuery

	const setQuery = useCallback((newQuery: string) => {
		setQueryState(newQuery)
	}, [])

	const clearQuery = useCallback(() => {
		setQueryState("")
	}, [])

	const isSearchActive = useMemo(() => {
		return debouncedQuery.length >= minLength
	}, [debouncedQuery, minLength])

	return {
		query,
		debouncedQuery,
		setQuery,
		clearQuery,
		isSearchActive,
		isDebouncing,
	}
}
