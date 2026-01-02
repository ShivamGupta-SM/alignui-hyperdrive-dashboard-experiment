/**
 * Pagination Hook
 *
 * Simple, focused pagination for list views.
 * Supports URL sync for state persistence.
 */

"use client"

import { useCallback, useMemo } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { DEFAULT_PAGE_SIZE } from "@/lib/utils/query-config"

// ============================================
// Types
// ============================================

export interface PaginationMeta {
	totalItems: number
	totalPages: number
	hasNextPage: boolean
	hasPrevPage: boolean
}

export interface UsePaginationOptions {
	defaultPageSize?: number
	syncWithUrl?: boolean
	pageParam?: string
	pageSizeParam?: string
}

export interface UsePaginationReturn {
	page: number
	pageSize: number
	skip: number
	take: number
	setPage: (page: number) => void
	setPageSize: (size: number) => void
	getMeta: (totalItems: number) => PaginationMeta
}

// ============================================
// Hook Implementation
// ============================================

/**
 * usePagination - Simple pagination hook for list views
 *
 * @example
 * const { page, pageSize, skip, take, setPage, getMeta } = usePagination({ syncWithUrl: true })
 *
 * const { data } = useCampaigns(orgId, { skip, take })
 * const meta = getMeta(data?.total ?? 0)
 *
 * <Pagination
 *   currentPage={page}
 *   totalPages={meta.totalPages}
 *   onPageChange={setPage}
 * />
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
	const {
		defaultPageSize = DEFAULT_PAGE_SIZE,
		syncWithUrl = false,
		pageParam = "page",
		pageSizeParam = "pageSize",
	} = options

	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	// Get current values from URL or defaults
	const page = syncWithUrl
		? Math.max(1, Number.parseInt(searchParams.get(pageParam) ?? "1", 10))
		: 1
	const pageSize = syncWithUrl
		? Number.parseInt(searchParams.get(pageSizeParam) ?? String(defaultPageSize), 10)
		: defaultPageSize

	const skip = (page - 1) * pageSize
	const take = pageSize

	// Update URL
	const updateUrl = useCallback(
		(newPage: number, newPageSize: number) => {
			if (!syncWithUrl) return
			const params = new URLSearchParams(searchParams.toString())

			if (newPage === 1) params.delete(pageParam)
			else params.set(pageParam, String(newPage))

			if (newPageSize === defaultPageSize) params.delete(pageSizeParam)
			else params.set(pageSizeParam, String(newPageSize))

			const queryString = params.toString()
			router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false })
		},
		[syncWithUrl, searchParams, pageParam, pageSizeParam, defaultPageSize, router, pathname]
	)

	const setPage = useCallback(
		(newPage: number) => updateUrl(Math.max(1, newPage), pageSize),
		[pageSize, updateUrl]
	)

	const setPageSize = useCallback(
		(newSize: number) => updateUrl(1, newSize), // Reset to page 1
		[updateUrl]
	)

	const getMeta = useCallback(
		(totalItems: number): PaginationMeta => {
			const totalPages = Math.ceil(totalItems / pageSize) || 1
			return {
				totalItems,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			}
		},
		[page, pageSize]
	)

	return useMemo(() => ({
		page,
		pageSize,
		skip,
		take,
		setPage,
		setPageSize,
		getMeta,
	}), [page, pageSize, skip, take, setPage, setPageSize, getMeta])
}

// ============================================
// Utility Functions
// ============================================

/**
 * Calculate pagination info (for server-side or non-hook contexts)
 */
export function calculatePagination(
	page: number,
	pageSize: number,
	totalItems: number
): PaginationMeta & { startItem: number; endItem: number } {
	const totalPages = Math.ceil(totalItems / pageSize) || 1
	const skip = (page - 1) * pageSize
	return {
		totalItems,
		totalPages,
		hasNextPage: page < totalPages,
		hasPrevPage: page > 1,
		startItem: totalItems === 0 ? 0 : skip + 1,
		endItem: Math.min(skip + pageSize, totalItems),
	}
}

/**
 * Generate page numbers for pagination UI
 */
export function generatePageNumbers(
	currentPage: number,
	totalPages: number,
	maxVisible = 7
): (number | "ellipsis")[] {
	if (totalPages <= maxVisible) {
		return Array.from({ length: totalPages }, (_, i) => i + 1)
	}

	const pages: (number | "ellipsis")[] = [1]
	const halfVisible = Math.floor((maxVisible - 3) / 2)

	if (currentPage <= halfVisible + 2) {
		for (let i = 2; i <= maxVisible - 2; i++) pages.push(i)
		pages.push("ellipsis")
	} else if (currentPage >= totalPages - halfVisible - 1) {
		pages.push("ellipsis")
		for (let i = totalPages - maxVisible + 3; i <= totalPages - 1; i++) pages.push(i)
	} else {
		pages.push("ellipsis")
		for (let i = currentPage - halfVisible; i <= currentPage + halfVisible; i++) pages.push(i)
		pages.push("ellipsis")
	}

	pages.push(totalPages)
	return pages
}

// ============================================
// Backward Compatibility Types
// ============================================

export type PaginationState = Pick<UsePaginationReturn, 'page' | 'pageSize' | 'skip' | 'take'>
export type PaginationActions = Pick<UsePaginationReturn, 'setPage' | 'setPageSize'>
