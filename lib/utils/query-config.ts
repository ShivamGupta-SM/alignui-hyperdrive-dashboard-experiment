/**
 * React Query Configuration Constants
 *
 * Centralized stale time values for consistent caching across the app.
 * Use these constants instead of inline magic numbers.
 */

// ============================================
// Stale Time Constants (in milliseconds)
// ============================================
export const STALE_TIME = {
	/** 30 seconds - For frequently changing data (wallet balances, real-time stats) */
	REALTIME: 30 * 1000,

	/** 1 minute - For moderately dynamic data (lists, search results, activities) */
	SHORT: 60 * 1000,

	/** 5 minutes - For semi-static data (user profiles, organization data, settings) */
	MEDIUM: 5 * 60 * 1000,

	/** 10 minutes - For rarely changing data (platforms, categories, static configs) */
	LONG: 10 * 60 * 1000,
} as const

// Type for stale time values
export type StaleTimeKey = keyof typeof STALE_TIME

// ============================================
// Pagination Utilities
// ============================================

/** Default page size for lists */
export const DEFAULT_PAGE_SIZE = 10

/**
 * Convert page-based pagination (user-friendly) to skip/take (backend)
 * @param page - 1-indexed page number (default: 1)
 * @param pageSize - Items per page (default: DEFAULT_PAGE_SIZE)
 * @returns { skip, take } for backend API
 */
export function toSkipTake(page = 1, pageSize = DEFAULT_PAGE_SIZE): { skip: number; take: number } {
	return {
		skip: (page - 1) * pageSize,
		take: pageSize,
	}
}

/**
 * Convert skip/take (backend) to page-based pagination (user-friendly)
 * @param skip - Number of items to skip
 * @param take - Number of items to take
 * @returns { page, pageSize } for UI display
 */
export function toPageLimit(skip = 0, take = DEFAULT_PAGE_SIZE): { page: number; pageSize: number } {
	return {
		page: Math.floor(skip / take) + 1,
		pageSize: take,
	}
}
