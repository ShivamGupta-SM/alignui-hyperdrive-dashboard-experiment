/**
 * useDebounceSearch Hook
 *
 * @description
 * Centralized debounce search hook for consistent search behavior.
 * Replaces duplicated debounce logic in campaigns-client and enrollments-client.
 *
 * @example
 * ```tsx
 * const { query, debouncedQuery, setQuery, clearQuery, isSearchActive } = useDebounceSearch()
 * ```
 */

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"

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
	const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
	const [isDebouncing, setIsDebouncing] = useState(false)

	// Debounce the query
	useEffect(() => {
		setIsDebouncing(true)
		const timer = setTimeout(() => {
			setDebouncedQuery(query)
			setIsDebouncing(false)
		}, delay)

		return () => {
			clearTimeout(timer)
		}
	}, [query, delay])

	const setQuery = useCallback((newQuery: string) => {
		setQueryState(newQuery)
	}, [])

	const clearQuery = useCallback(() => {
		setQueryState("")
		setDebouncedQuery("")
		setIsDebouncing(false)
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

/**
 * Hook for debounced value (generic version)
 * For cases where you need to debounce any value, not just search
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
	const [debouncedValue, setDebouncedValue] = useState(value)

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => {
			clearTimeout(timer)
		}
	}, [value, delay])

	return debouncedValue
}
