/**
 * Optimistic Update Utilities
 *
 * SIMPLIFIED: Single core function with helper utilities.
 * Provides consistent patterns for optimistic UI updates with automatic rollback.
 */

import type { QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "./format"

// ============================================
// Core Optimistic Update Function
// ============================================

interface OptimisticUpdateOptions<TData, TResult> {
	queryClient: QueryClient
	queryKey: readonly unknown[]
	updateFn: (oldData: TData | undefined) => TData | undefined
	serverFn: () => Promise<TResult>
	onSuccess?: (result: TResult) => void
	onError?: (error: unknown) => void
	invalidateKeys?: (readonly unknown[])[]
	successMessage?: string
	errorMessage?: string
}

/**
 * Core optimistic update - handles any cache update pattern.
 *
 * @example
 * await performOptimisticUpdate({
 *   queryClient,
 *   queryKey: campaignKeys.detail(orgId, id),
 *   updateFn: (old) => old ? { ...old, status: 'paused' } : old,
 *   serverFn: () => updateCampaignStatus({ id, action: 'pause' }),
 *   successMessage: 'Campaign paused',
 * })
 */
export async function performOptimisticUpdate<TData, TResult>({
	queryClient,
	queryKey,
	updateFn,
	serverFn,
	onSuccess,
	onError,
	invalidateKeys = [],
	successMessage,
	errorMessage = "An error occurred",
}: OptimisticUpdateOptions<TData, TResult>): Promise<TResult | undefined> {
	// Snapshot previous value for rollback
	const previousData = queryClient.getQueryData<TData>(queryKey)

	// Optimistically update cache
	queryClient.setQueryData<TData>(queryKey, updateFn)

	try {
		const result = await serverFn()

		// Invalidate related queries
		for (const key of invalidateKeys) {
			queryClient.invalidateQueries({ queryKey: key })
		}
		queryClient.invalidateQueries({ queryKey })

		if (successMessage) toast.success(successMessage)
		onSuccess?.(result)

		return result
	} catch (error) {
		// Rollback on error
		queryClient.setQueryData<TData>(queryKey, previousData)
		toast.error(getErrorMessage(error, errorMessage))
		onError?.(error)

		return undefined
	}
}

// ============================================
// Convenience Helpers (thin wrappers)
// ============================================

/**
 * Update a specific item in a list by ID
 */
export async function performListItemOptimisticUpdate<
	TItem extends { id: string },
	TResult,
>({
	queryClient,
	queryKey,
	itemId,
	updateFn,
	serverFn,
	...rest
}: Omit<OptimisticUpdateOptions<{ data: TItem[] } | TItem[], TResult>, "updateFn"> & {
	itemId: string
	updateFn: (item: TItem) => TItem
}): Promise<TResult | undefined> {
	return performOptimisticUpdate<{ data: TItem[] } | TItem[], TResult>({
		queryClient,
		queryKey,
		updateFn: (oldData) => {
			if (!oldData) return oldData

			if (Array.isArray(oldData)) {
				return oldData.map((item) =>
					item.id === itemId ? updateFn(item) : item
				) as TItem[]
			}

			if ("data" in oldData && Array.isArray(oldData.data)) {
				return {
					...oldData,
					data: oldData.data.map((item) =>
						item.id === itemId ? updateFn(item) : item
					),
				}
			}

			return oldData
		},
		serverFn,
		...rest,
	})
}

/**
 * Remove an item from a list by ID
 */
export async function performOptimisticDelete<
	TItem extends { id: string },
	TResult,
>({
	queryClient,
	queryKey,
	itemId,
	serverFn,
	errorMessage = "Failed to delete",
	...rest
}: Omit<OptimisticUpdateOptions<{ data: TItem[] } | TItem[], TResult>, "updateFn"> & {
	itemId: string
}): Promise<TResult | undefined> {
	return performOptimisticUpdate<{ data: TItem[] } | TItem[], TResult>({
		queryClient,
		queryKey,
		updateFn: (oldData) => {
			if (!oldData) return oldData

			if (Array.isArray(oldData)) {
				return oldData.filter((item) => item.id !== itemId) as TItem[]
			}

			if ("data" in oldData && Array.isArray(oldData.data)) {
				return {
					...oldData,
					data: oldData.data.filter((item) => item.id !== itemId),
				}
			}

			return oldData
		},
		serverFn,
		errorMessage,
		...rest,
	})
}

/**
 * Update status field on both detail and list caches
 */
export async function performStatusChange<
	TItem extends { id: string; status: string },
	TResult,
>({
	queryClient,
	listKey,
	detailKey,
	itemId,
	newStatus,
	serverFn,
	successMessage,
	errorMessage,
}: {
	queryClient: QueryClient
	listKey: readonly unknown[]
	detailKey: readonly unknown[]
	itemId: string
	newStatus: string
	serverFn: () => Promise<TResult>
	successMessage?: string
	errorMessage?: string
}): Promise<TResult | undefined> {
	// Update detail cache first
	const previousDetail = queryClient.getQueryData<TItem>(detailKey)
	if (previousDetail) {
		queryClient.setQueryData<TItem>(detailKey, { ...previousDetail, status: newStatus })
	}

	// Update list cache
	return performListItemOptimisticUpdate<TItem, TResult>({
		queryClient,
		queryKey: listKey,
		itemId,
		updateFn: (item) => ({ ...item, status: newStatus }),
		serverFn,
		onError: () => {
			// Rollback detail cache on error
			if (previousDetail) {
				queryClient.setQueryData<TItem>(detailKey, previousDetail)
			}
		},
		invalidateKeys: [detailKey],
		successMessage,
		errorMessage,
	})
}
