/**
 * React Query Configuration Constants
 *
 * SSOT: Centralized query configuration for the entire app.
 * All stale times and page sizes should be imported from here.
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

// ============================================
// Garbage Collection Time Constants (in milliseconds)
// How long unused/inactive query data stays in cache
// ============================================
export const GC_TIME = {
	/** 5 minutes - For frequently changing data (keep in cache briefly) */
	SHORT: 5 * 60 * 1000,

	/** 15 minutes - Default for most data */
	MEDIUM: 15 * 60 * 1000,

	/** 30 minutes - For semi-static data (org details, settings) */
	LONG: 30 * 60 * 1000,

	/** 1 hour - For rarely changing data (platforms, categories) */
	VERY_LONG: 60 * 60 * 1000,
} as const

// Type for gc time values
export type GcTimeKey = keyof typeof GC_TIME

// Type for stale time values
export type StaleTimeKey = keyof typeof STALE_TIME

// ============================================
// Refetch Interval Constants (in milliseconds)
// ============================================
export const REFETCH_INTERVAL = {
	/** 30 seconds - For real-time data (notifications, unread counts) */
	REALTIME: 30 * 1000,

	/** 1 minute - For frequently updating data (activity feeds) */
	SHORT: 60 * 1000,

	/** 5 minutes - For moderately dynamic data */
	MEDIUM: 5 * 60 * 1000,
} as const

// Type for refetch interval values
export type RefetchIntervalKey = keyof typeof REFETCH_INTERVAL

// ============================================
// Pagination Constants - SSOT
// All hooks should import page sizes from here
// ============================================

/** Default page size for client-side lists */
export const DEFAULT_PAGE_SIZE = 10

/** Standard page sizes for different contexts */
export const PAGE_SIZE = {
	/** Default for client-side pagination */
	DEFAULT: 10,
	/** Small lists (quick loads, preview sections) */
	SMALL: 20,
	/** Medium lists (main list views) */
	MEDIUM: 50,
	/** Large lists (export, bulk operations) */
	LARGE: 100,
} as const

/** SSR page sizes - used for server-side data fetching */
export const SSR_PAGE_SIZE = {
	/** Default SSR fetch size */
	DEFAULT: 50,
	/** Small lists (quick loads) */
	SMALL: 20,
	/** Large lists (products, enrollments, etc.) */
	LARGE: 100,
} as const

// ============================================
// Retry Configuration - SSOT
// All hooks should use this instead of hardcoding
// ============================================

/** Default retry count for failed queries */
export const DEFAULT_RETRY_COUNT = 2

/** Maximum retry delay in milliseconds */
export const MAX_RETRY_DELAY_MS = 10000

/**
 * Default retry configuration for React Query
 * Use this in useQuery/useMutation options for consistent retry behavior
 *
 * @example
 * useQuery({
 *   queryKey: [...],
 *   queryFn: ...,
 *   ...DEFAULT_RETRY_CONFIG,
 * })
 */
export const DEFAULT_RETRY_CONFIG = {
	retry: DEFAULT_RETRY_COUNT,
	retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, MAX_RETRY_DELAY_MS),
} as const

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

// ============================================
// Mutation Error Handler - Re-export from SSOT
// ============================================

// SSOT: createMutationErrorHandler is defined in error-logger-simple.ts
// Import for internal use and re-export for external consumers
import { createMutationErrorHandler as _createMutationErrorHandler } from "@/lib/logging/error-logger-simple"
export const createMutationErrorHandler = _createMutationErrorHandler

// ============================================
// Query Key Factory - SSOT
// Generic factory to create consistent query keys across features
// Eliminates ~650 lines of duplicate query key definitions
// ============================================

/**
 * Base query key factory interface
 * All feature query keys will extend this pattern
 */
export interface BaseQueryKeyFactory<TFeature extends string> {
	/** Root key for all queries of this feature */
	all: (orgId: string) => readonly [TFeature, string]
	/** List queries key */
	lists: (orgId: string) => readonly [TFeature, string, "list"]
	/** Single list with filters */
	list: (orgId: string, filters?: ListFilters) => readonly (string | number)[]
	/** All detail queries key */
	details: (orgId: string) => readonly [TFeature, string, "detail"]
	/** Single detail query key */
	detail: (orgId: string, id: string) => readonly [TFeature, string, "detail", string]
}

/**
 * Standard list filters used across features
 */
export interface ListFilters {
	skip?: number
	take?: number
	status?: string
	search?: string
}

/**
 * Creates a query key factory for a feature
 *
 * @example
 * // In features/campaigns/hooks/use-campaigns.ts
 * export const campaignKeys = createQueryKeyFactory("campaigns")
 *
 * // Usage
 * campaignKeys.all("org-123")        // ["campaigns", "org-123"]
 * campaignKeys.lists("org-123")      // ["campaigns", "org-123", "list"]
 * campaignKeys.detail("org-123", "1") // ["campaigns", "org-123", "detail", "1"]
 */
export function createQueryKeyFactory<TFeature extends string>(
	feature: TFeature
): BaseQueryKeyFactory<TFeature> {
	return {
		all: (orgId: string) => [feature, orgId] as const,
		lists: (orgId: string) => [feature, orgId, "list"] as const,
		list: (orgId: string, filters?: ListFilters) => [
			feature,
			orgId,
			"list",
			filters?.status ?? "all",
			filters?.skip ?? 0,
			filters?.take ?? 50,
		] as const,
		details: (orgId: string) => [feature, orgId, "detail"] as const,
		detail: (orgId: string, id: string) => [feature, orgId, "detail", id] as const,
	}
}

/**
 * Extended query key factory with search support
 * Use for features that need search functionality
 */
export interface SearchableQueryKeyFactory<TFeature extends string>
	extends BaseQueryKeyFactory<TFeature> {
	search: (orgId: string, query: string) => readonly [TFeature, string, "search", string]
}

/**
 * Creates a searchable query key factory
 *
 * @example
 * export const campaignKeys = createSearchableQueryKeyFactory("campaigns")
 * campaignKeys.search("org-123", "summer") // ["campaigns", "org-123", "search", "summer"]
 */
export function createSearchableQueryKeyFactory<TFeature extends string>(
	feature: TFeature
): SearchableQueryKeyFactory<TFeature> {
	const base = createQueryKeyFactory(feature)
	return {
		...base,
		search: (orgId: string, query: string) => [feature, orgId, "search", query] as const,
	}
}

/**
 * Query key factory with stats support
 * Use for features that have statistics endpoints
 */
export interface StatsQueryKeyFactory<TFeature extends string>
	extends SearchableQueryKeyFactory<TFeature> {
	stats: (orgId: string, id: string) => readonly [TFeature, string, "detail", string, "stats"]
}

/**
 * Creates a query key factory with stats support
 */
export function createStatsQueryKeyFactory<TFeature extends string>(
	feature: TFeature
): StatsQueryKeyFactory<TFeature> {
	const base = createSearchableQueryKeyFactory(feature)
	return {
		...base,
		stats: (orgId: string, id: string) => [feature, orgId, "detail", id, "stats"] as const,
	}
}

/**
 * Global (non-org-scoped) query key factory
 * Use for features that don't require organizationId
 */
export interface GlobalQueryKeyFactory<TFeature extends string> {
	all: () => readonly [TFeature]
	list: (filters?: ListFilters) => readonly (string | number)[]
	detail: (id: string) => readonly [TFeature, "detail", string]
}

/**
 * Creates a global query key factory (non-org-scoped)
 *
 * @example
 * export const platformKeys = createGlobalQueryKeyFactory("platforms")
 * platformKeys.all()        // ["platforms"]
 * platformKeys.detail("1")  // ["platforms", "detail", "1"]
 */
export function createGlobalQueryKeyFactory<TFeature extends string>(
	feature: TFeature
): GlobalQueryKeyFactory<TFeature> {
	return {
		all: () => [feature] as const,
		list: (filters?: ListFilters) => [
			feature,
			"list",
			filters?.status ?? "all",
			filters?.skip ?? 0,
			filters?.take ?? 50,
		] as const,
		detail: (id: string) => [feature, "detail", id] as const,
	}
}

// ============================================
// Mutation Hook Factory - SSOT
// Reduces ~800 lines of duplicate mutation boilerplate
// ============================================

import type { QueryKey, QueryClient, UseMutationResult } from "@tanstack/react-query"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

/**
 * Invalidation strategy for mutations
 */
export type InvalidationStrategy =
	| "none" // No cache invalidation
	| "list" // Invalidate list queries only
	| "detail" // Invalidate detail query only
	| "both" // Invalidate both list and detail queries
	| "custom" // Use custom invalidation function

/**
 * Options for creating a mutation hook
 */
export interface CreateMutationHookOptions<TInput, TOutput, TKeys extends BaseQueryKeyFactory<string>> {
	/** Server action to call */
	action: (input: TInput & { organizationId: string }) => Promise<TOutput>
	/** Query keys factory for cache invalidation */
	keys: TKeys
	/** Invalidation strategy */
	invalidate?: InvalidationStrategy
	/** Custom invalidation function (when invalidate="custom") */
	customInvalidate?: (qc: QueryClient, orgId: string, input: TInput, output: TOutput) => void
	/** Success message (if provided, shows toast) */
	successMessage?: string
	/** Error action name for error handler */
	errorAction: string
	/** Extract ID from input for detail invalidation */
	getId?: (input: TInput) => string
}

/**
 * Creates a mutation hook with standard patterns
 * Reduces boilerplate for common mutation operations
 *
 * @example
 * // Simple list invalidation
 * export const useCreateProduct = createMutationHook({
 *   action: actions.createProduct,
 *   keys: productKeys,
 *   invalidate: "list",
 *   successMessage: "Product created",
 *   errorAction: "create product",
 * })
 *
 * // Detail + list invalidation
 * export const useUpdateProduct = createMutationHook({
 *   action: actions.updateProduct,
 *   keys: productKeys,
 *   invalidate: "both",
 *   getId: (input) => input.id,
 *   successMessage: "Product updated",
 *   errorAction: "update product",
 * })
 */
export function createMutationHook<
	TInput,
	TOutput,
	TKeys extends BaseQueryKeyFactory<string>
>(
	options: CreateMutationHookOptions<TInput, TOutput, TKeys>
): (orgId: string) => UseMutationResult<TOutput, unknown, TInput> {
	const {
		action,
		keys,
		invalidate = "list",
		customInvalidate,
		successMessage,
		errorAction,
		getId,
	} = options

	return function useMutationHook(orgId: string) {
		const qc = useQueryClient()

		return useMutation({
			mutationFn: (input: TInput) => action({ ...input, organizationId: orgId }),
			onSuccess: (output, input) => {
				// Handle cache invalidation based on strategy
				switch (invalidate) {
					case "list":
						qc.invalidateQueries({ queryKey: keys.lists(orgId) })
						break
					case "detail":
						if (getId) {
							qc.invalidateQueries({ queryKey: keys.detail(orgId, getId(input)) })
						}
						break
					case "both":
						if (getId) {
							qc.invalidateQueries({ queryKey: keys.detail(orgId, getId(input)) })
						}
						qc.invalidateQueries({ queryKey: keys.lists(orgId) })
						break
					case "custom":
						customInvalidate?.(qc, orgId, input, output)
						break
					case "none":
						// No invalidation needed
						break
				}

				// Show success toast if message provided
				if (successMessage) {
					toast.success(successMessage)
				}
			},
			onError: createMutationErrorHandler(errorAction),
		})
	}
}

/**
 * Creates a global mutation hook (non-org-scoped)
 *
 * Unified factory that handles:
 * - Global mutations (no org context)
 * - Mutations where orgId comes from input
 * - Static or dynamic invalidation keys
 *
 * @example Static invalidation (global auth)
 * ```tsx
 * export const useUpdateProfile = createGlobalMutationHook({
 *   action: authActions.updateProfile,
 *   invalidateKeys: [authKeys.session()],
 *   successMessage: "Profile updated",
 *   errorAction: "update profile",
 * })
 * ```
 *
 * @example Dynamic invalidation (org from input)
 * ```tsx
 * export const useAcceptInvitation = createGlobalMutationHook({
 *   action: actions.acceptInvitation,
 *   getOrgId: (input) => input.organizationId,
 *   invalidateKeys: (orgId) => [organizationKeys.lists()],
 *   successMessage: "Invitation accepted",
 *   errorAction: "accept invitation",
 * })
 * ```
 */
export interface CreateGlobalMutationHookOptions<TInput, TOutput> {
	action: (input: TInput) => Promise<TOutput>
	/** Extract orgId from input for dynamic invalidation */
	getOrgId?: (input: TInput) => string
	/** Static keys or function for dynamic keys based on orgId */
	invalidateKeys?: QueryKey[] | ((orgId: string | undefined) => QueryKey[])
	successMessage?: string
	errorAction: string
}

export function createGlobalMutationHook<TInput, TOutput>(
	options: CreateGlobalMutationHookOptions<TInput, TOutput>
): () => UseMutationResult<TOutput, unknown, TInput> {
	const { action, getOrgId, invalidateKeys, successMessage, errorAction } = options

	return function useMutationHook() {
		const qc = useQueryClient()

		return useMutation({
			mutationFn: action,
			onSuccess: (_, input) => {
				if (invalidateKeys) {
					const orgId = getOrgId?.(input)
					// Handle both static array and dynamic function
					const keys = typeof invalidateKeys === 'function'
						? invalidateKeys(orgId)
						: invalidateKeys
					for (const key of keys) {
						qc.invalidateQueries({ queryKey: key })
					}
				}
				if (successMessage) {
					toast.success(successMessage)
				}
			},
			onError: createMutationErrorHandler(errorAction),
		})
	}
}

// ============================================
// Backward Compatibility Aliases
// ============================================

/**
 * @deprecated Use `createGlobalMutationHook` instead
 */
export const createSimpleMutationHook = createGlobalMutationHook

/**
 * @deprecated Use `createGlobalMutationHook` instead
 */
export const createFlexMutationHook = createGlobalMutationHook
