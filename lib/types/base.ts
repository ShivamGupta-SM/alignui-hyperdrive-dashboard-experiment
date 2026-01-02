/**
 * Base Types - Shared Interfaces
 *
 * @description
 * Base interfaces used across all features for consistency.
 * All feature-specific filter interfaces should extend BaseFilters.
 */

/**
 * Base filter interface for all list queries
 * Common pagination fields used across all features
 */
export interface BaseFilters {
	skip?: number
	take?: number
	search?: string
}

/**
 * Sortable filter extension
 * For features that support sorting
 */
export interface SortableFilters extends BaseFilters {
	sortBy?: string
	sortOrder?: "asc" | "desc"
}

/**
 * Date range filter extension
 * For features that support date filtering
 */
export interface DateRangeFilters extends BaseFilters {
	startDate?: string | Date
	endDate?: string | Date
}

/**
 * Standard pagination response structure
 */
export interface PaginationMeta {
	total: number
	skip: number
	take: number
	hasMore: boolean
}

/**
 * Base stats interface
 * All feature-specific stats interfaces should extend this
 */
export interface BaseStats {
	total: number
}

/**
 * Generic page client props interface
 * Use this for all *-client.tsx page components to ensure consistency
 *
 * @example
 * interface CampaignsClientProps extends PageClientProps<Campaign> {
 *   organizationId: string
 * }
 */
export interface PageClientProps<T, TStats = BaseStats> {
	initialData?: {
		data: T[]
		total?: number
		stats?: TStats
	}
}

/**
 * Generic page client props with single item
 * Use for detail pages like /campaigns/[id]
 */
export interface DetailPageClientProps<T> {
	initialData?: T | null
}

/**
 * Generic list response from SSR
 * Standardizes what SSR functions return
 */
export interface SSRListResponse<T, TStats = BaseStats> {
	data: T[]
	total: number
	stats?: TStats
}

// =============================================================================
// Bulk Operation Types - Standardized Result Pattern
// =============================================================================

/**
 * Error detail for individual item failure in bulk operations
 */
export interface BulkOperationError {
	id: string
	error: string
	code?: string
}

/**
 * Standard result type for bulk operations
 * ✅ FIX: Centralizes bulk operation response structure
 * Previously each feature had its own inconsistent structure
 *
 * @example Usage in server actions
 * ```tsx
 * // In enrollments actions
 * export const bulkApproveEnrollments = authAction
 *   .inputSchema(bulkApproveSchema)
 *   .action(async ({ parsedInput, ctx }): Promise<BulkOperationResult<{ id: string }>> => {
 *     // ...
 *     return {
 *       succeeded: approvedIds.map(id => ({ id })),
 *       failed: failedOps,
 *       total: ids.length,
 *       successCount: approvedIds.length,
 *       failedCount: failedOps.length,
 *     }
 *   })
 * ```
 *
 * @example Usage in hooks
 * ```tsx
 * const { mutate, data } = useBulkApprove(orgId)
 * // data is BulkOperationResult<{ id: string }>
 * if (data?.failedCount > 0) {
 *   toast.error(`${data.failedCount} items failed`)
 * }
 * ```
 */
export interface BulkOperationResult<T = void> {
	/** Items that were successfully processed */
	succeeded: T extends void ? string[] : T[]
	/** Items that failed with error details */
	failed: BulkOperationError[]
	/** Total items attempted */
	total: number
	/** Count of successful operations */
	successCount: number
	/** Count of failed operations */
	failedCount: number
}

/**
 * Partial update result (for PATCH operations)
 * Tracks which fields were actually updated
 */
export interface PartialUpdateResult<T> {
	updated: Partial<T>
	unchanged: (keyof T)[]
}
