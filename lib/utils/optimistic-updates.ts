/**
 * Optimistic Update Utilities
 *
 * SSOT: Centralized utilities for optimistic updates across the app.
 * These helpers provide consistent patterns for optimistic UI updates
 * with automatic rollback on errors.
 */

import type { QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "./format"

/**
 * Generic optimistic update helper
 * Immediately updates UI, then syncs with server
 *
 * @example
 * await performOptimisticUpdate({
 *   queryClient,
 *   queryKey: campaignKeys.detail(orgId, campaignId),
 *   updateFn: (old) => ({ ...old, status: 'paused' }),
 *   serverFn: () => updateCampaignStatus({ organizationId, id, action: 'pause' }),
 *   onSuccess: () => toast.success('Campaign paused'),
 *   onError: (error) => toast.error(getErrorMessage(error)),
 *   invalidateKeys: [campaignKeys.lists(orgId)],
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
}: {
	queryClient: QueryClient
	queryKey: readonly unknown[]
	updateFn: (oldData: TData | undefined) => TData | undefined
	serverFn: () => Promise<TResult>
	onSuccess?: (result: TResult) => void
	onError?: (error: unknown) => void
	invalidateKeys?: (readonly unknown[])[]
	successMessage?: string
	errorMessage?: string
}): Promise<TResult | undefined> {
	// Snapshot the previous value
	const previousData = queryClient.getQueryData<TData>(queryKey)

	// Optimistically update to the new value
	queryClient.setQueryData<TData>(queryKey, updateFn)

	try {
		// Execute the server action
		const result = await serverFn()

		// Invalidate related queries to ensure consistency
		for (const key of invalidateKeys) {
			queryClient.invalidateQueries({ queryKey: key })
		}

		// Also invalidate the main query to get fresh data
		queryClient.invalidateQueries({ queryKey })

		// Show success toast if provided
		if (successMessage) {
			toast.success(successMessage)
		}

		// Call success callback
		onSuccess?.(result)

		return result
	} catch (error) {
		// Rollback to the previous value on error
		queryClient.setQueryData<TData>(queryKey, previousData)

		// Show error toast
		toast.error(getErrorMessage(error, errorMessage))

		// Call error callback
		onError?.(error)

		return undefined
	}
}

/**
 * Optimistic update for list items
 * Updates a specific item in a list by ID
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
	onSuccess,
	onError,
	invalidateKeys = [],
	successMessage,
	errorMessage = "An error occurred",
}: {
	queryClient: QueryClient
	queryKey: readonly unknown[]
	itemId: string
	updateFn: (item: TItem) => TItem
	serverFn: () => Promise<TResult>
	onSuccess?: (result: TResult) => void
	onError?: (error: unknown) => void
	invalidateKeys?: (readonly unknown[])[]
	successMessage?: string
	errorMessage?: string
}): Promise<TResult | undefined> {
	return performOptimisticUpdate<{ data: TItem[] } | TItem[], TResult>({
		queryClient,
		queryKey,
		updateFn: (oldData) => {
			if (!oldData) return oldData

			// Handle both { data: TItem[] } and TItem[] formats
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
		onSuccess,
		onError,
		invalidateKeys,
		successMessage,
		errorMessage,
	})
}

/**
 * Optimistic delete for list items
 * Removes an item from a list by ID
 */
export async function performOptimisticDelete<
	TItem extends { id: string },
	TResult,
>({
	queryClient,
	queryKey,
	itemId,
	serverFn,
	onSuccess,
	onError,
	invalidateKeys = [],
	successMessage,
	errorMessage = "Failed to delete",
}: {
	queryClient: QueryClient
	queryKey: readonly unknown[]
	itemId: string
	serverFn: () => Promise<TResult>
	onSuccess?: (result: TResult) => void
	onError?: (error: unknown) => void
	invalidateKeys?: (readonly unknown[])[]
	successMessage?: string
	errorMessage?: string
}): Promise<TResult | undefined> {
	return performOptimisticUpdate<{ data: TItem[] } | TItem[], TResult>({
		queryClient,
		queryKey,
		updateFn: (oldData) => {
			if (!oldData) return oldData

			// Handle both { data: TItem[] } and TItem[] formats
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
		onSuccess,
		onError,
		invalidateKeys,
		successMessage,
		errorMessage,
	})
}

/**
 * Simple optimistic status change helper
 * Convenience wrapper for status updates
 */
export async function performStatusChange<TItem extends { id: string; status: string }, TResult>({
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
	// Update detail cache
	const detailPreviousData = queryClient.getQueryData<TItem>(detailKey)
	if (detailPreviousData) {
		queryClient.setQueryData<TItem>(detailKey, {
			...detailPreviousData,
			status: newStatus,
		})
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
			if (detailPreviousData) {
				queryClient.setQueryData<TItem>(detailKey, detailPreviousData)
			}
		},
		invalidateKeys: [detailKey],
		successMessage,
		errorMessage,
	})
}
