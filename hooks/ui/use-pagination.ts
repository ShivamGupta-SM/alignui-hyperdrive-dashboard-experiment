/**
 * Pagination Hook
 *
 * SSOT: Centralized pagination logic used across all list views.
 * Eliminates ~400 lines of duplicate pagination code across features.
 *
 * Features:
 * - URL-based pagination state (preserves state on refresh)
 * - Flexible page size options
 * - Compatible with React Query infinite queries
 * - Type-safe with generics
 */

"use client"

import { useCallback, useMemo } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { DEFAULT_PAGE_SIZE, PAGE_SIZE } from "@/lib/utils/query-config"

// ============================================
// Types
// ============================================

export interface PaginationState {
	page: number
	pageSize: number
	skip: number
	take: number
}

export interface PaginationActions {
	setPage: (page: number) => void
	setPageSize: (size: number) => void
	nextPage: () => void
	prevPage: () => void
	firstPage: () => void
	lastPage: (totalPages: number) => void
	reset: () => void
}

export interface PaginationMeta {
	totalItems: number
	totalPages: number
	hasNextPage: boolean
	hasPrevPage: boolean
	isFirstPage: boolean
	isLastPage: boolean
	startItem: number
	endItem: number
}

export interface UsePaginationOptions {
	/** Default page size (default: 10) */
	defaultPageSize?: number
	/** Whether to sync with URL search params */
	syncWithUrl?: boolean
	/** URL param name for page (default: "page") */
	pageParam?: string
	/** URL param name for page size (default: "pageSize") */
	pageSizeParam?: string
	/** Callback when page changes */
	onPageChange?: (page: number) => void
	/** Callback when page size changes */
	onPageSizeChange?: (size: number) => void
}

export interface UsePaginationReturn extends PaginationState, PaginationActions {
	/** Get pagination meta from total count */
	getMeta: (totalItems: number) => PaginationMeta
	/** Get query params for API call */
	getQueryParams: () => { skip: number; take: number }
	/** Available page size options */
	pageSizeOptions: number[]
}

// ============================================
// Constants
// ============================================

const DEFAULT_PAGE = 1
const PAGE_SIZE_OPTIONS = [
	PAGE_SIZE.DEFAULT,
	PAGE_SIZE.SMALL,
	PAGE_SIZE.MEDIUM,
	PAGE_SIZE.LARGE,
]

// ============================================
// Hook Implementation
// ============================================

/**
 * usePagination - Generic pagination hook for list views
 *
 * @example
 * // Basic usage with URL sync
 * const pagination = usePagination({ syncWithUrl: true })
 *
 * // With React Query
 * const { data } = useCampaigns(orgId, {
 *   skip: pagination.skip,
 *   take: pagination.take,
 * })
 *
 * // Get meta for UI
 * const meta = pagination.getMeta(data?.total ?? 0)
 *
 * // Render pagination UI
 * <Pagination
 *   currentPage={pagination.page}
 *   totalPages={meta.totalPages}
 *   onPageChange={pagination.setPage}
 * />
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
	const {
		defaultPageSize = DEFAULT_PAGE_SIZE,
		syncWithUrl = false,
		pageParam = "page",
		pageSizeParam = "pageSize",
		onPageChange,
		onPageSizeChange,
	} = options

	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	// Get current values from URL or defaults
	const page = syncWithUrl
		? Math.max(1, parseInt(searchParams.get(pageParam) ?? "1", 10))
		: DEFAULT_PAGE
	const pageSize = syncWithUrl
		? parseInt(searchParams.get(pageSizeParam) ?? String(defaultPageSize), 10)
		: defaultPageSize

	// Calculate skip/take for API
	const skip = (page - 1) * pageSize
	const take = pageSize

	// Update URL with new params
	const updateUrl = useCallback(
		(newPage: number, newPageSize: number) => {
			if (!syncWithUrl) return

			const params = new URLSearchParams(searchParams.toString())

			if (newPage === DEFAULT_PAGE) {
				params.delete(pageParam)
			} else {
				params.set(pageParam, String(newPage))
			}

			if (newPageSize === defaultPageSize) {
				params.delete(pageSizeParam)
			} else {
				params.set(pageSizeParam, String(newPageSize))
			}

			const queryString = params.toString()
			router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false })
		},
		[syncWithUrl, searchParams, pageParam, pageSizeParam, defaultPageSize, router, pathname]
	)

	// Actions
	const setPage = useCallback(
		(newPage: number) => {
			const validPage = Math.max(1, newPage)
			updateUrl(validPage, pageSize)
			onPageChange?.(validPage)
		},
		[pageSize, updateUrl, onPageChange]
	)

	const setPageSize = useCallback(
		(newSize: number) => {
			// Reset to first page when changing page size
			updateUrl(DEFAULT_PAGE, newSize)
			onPageSizeChange?.(newSize)
		},
		[updateUrl, onPageSizeChange]
	)

	const nextPage = useCallback(() => setPage(page + 1), [page, setPage])
	const prevPage = useCallback(() => setPage(page - 1), [page, setPage])
	const firstPage = useCallback(() => setPage(DEFAULT_PAGE), [setPage])
	const lastPage = useCallback((totalPages: number) => setPage(totalPages), [setPage])
	const reset = useCallback(() => {
		updateUrl(DEFAULT_PAGE, defaultPageSize)
	}, [updateUrl, defaultPageSize])

	// Get pagination meta from total count
	const getMeta = useCallback(
		(totalItems: number): PaginationMeta => {
			const totalPages = Math.ceil(totalItems / pageSize) || 1
			const startItem = totalItems === 0 ? 0 : skip + 1
			const endItem = Math.min(skip + pageSize, totalItems)

			return {
				totalItems,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
				isFirstPage: page === 1,
				isLastPage: page >= totalPages,
				startItem,
				endItem,
			}
		},
		[page, pageSize, skip]
	)

	// Get query params for API call
	const getQueryParams = useCallback(() => ({ skip, take }), [skip, take])

	return useMemo(
		() => ({
			// State
			page,
			pageSize,
			skip,
			take,
			// Actions
			setPage,
			setPageSize,
			nextPage,
			prevPage,
			firstPage,
			lastPage,
			reset,
			// Helpers
			getMeta,
			getQueryParams,
			pageSizeOptions: PAGE_SIZE_OPTIONS,
		}),
		[
			page,
			pageSize,
			skip,
			take,
			setPage,
			setPageSize,
			nextPage,
			prevPage,
			firstPage,
			lastPage,
			reset,
			getMeta,
			getQueryParams,
		]
	)
}

// ============================================
// Utility Functions
// ============================================

/**
 * Calculate pagination info from total count
 * Use this for server-side or non-hook contexts
 */
export function calculatePagination(
	page: number,
	pageSize: number,
	totalItems: number
): PaginationMeta {
	const totalPages = Math.ceil(totalItems / pageSize) || 1
	const skip = (page - 1) * pageSize
	const startItem = totalItems === 0 ? 0 : skip + 1
	const endItem = Math.min(skip + pageSize, totalItems)

	return {
		totalItems,
		totalPages,
		hasNextPage: page < totalPages,
		hasPrevPage: page > 1,
		isFirstPage: page === 1,
		isLastPage: page >= totalPages,
		startItem,
		endItem,
	}
}

/**
 * Generate page numbers for pagination UI
 * Returns an array of page numbers with ellipsis markers
 */
export function generatePageNumbers(
	currentPage: number,
	totalPages: number,
	maxVisible = 7
): (number | "ellipsis")[] {
	if (totalPages <= maxVisible) {
		return Array.from({ length: totalPages }, (_, i) => i + 1)
	}

	const pages: (number | "ellipsis")[] = []
	const halfVisible = Math.floor((maxVisible - 3) / 2)

	// Always show first page
	pages.push(1)

	if (currentPage <= halfVisible + 2) {
		// Near start: 1, 2, 3, 4, ..., last
		for (let i = 2; i <= maxVisible - 2; i++) {
			pages.push(i)
		}
		pages.push("ellipsis")
	} else if (currentPage >= totalPages - halfVisible - 1) {
		// Near end: 1, ..., n-3, n-2, n-1, n
		pages.push("ellipsis")
		for (let i = totalPages - maxVisible + 3; i <= totalPages - 1; i++) {
			pages.push(i)
		}
	} else {
		// Middle: 1, ..., current-1, current, current+1, ..., last
		pages.push("ellipsis")
		for (let i = currentPage - halfVisible; i <= currentPage + halfVisible; i++) {
			pages.push(i)
		}
		pages.push("ellipsis")
	}

	// Always show last page
	pages.push(totalPages)

	return pages
}
