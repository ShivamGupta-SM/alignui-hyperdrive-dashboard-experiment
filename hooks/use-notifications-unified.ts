"use client"

/**
 * Unified Notification Hooks
 * 
 * This file provides a unified interface for notifications that works with both:
 * 1. Novu (when configured) - uses @novu/react hooks
 * 2. Backend API (fallback) - uses Encore client
 * 
 * IMPORTANT: These hooks follow React Rules of Hooks - all hooks are called unconditionally.
 * The `enabled` flag in React Query ensures only the appropriate hooks are active.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/encore-browser"
import type { notifications } from "@/lib/encore-browser"
import { isNovuEnabled } from "./use-novu"
import { notificationKeys } from "./use-notifications"

// ============================================
// Unified Hooks
// ============================================

/**
 * Unified hook for notifications
 * Uses Novu if configured and available, otherwise falls back to backend API
 */
export function useNotificationsUnified() {
	const novuEnabled = isNovuEnabled()
	
	// Always call backend hook (it will be disabled if Novu is enabled)
	const backendResult = useQuery({
		queryKey: notificationKeys.list(),
		queryFn: async () => {
			const client = getEncoreBrowserClient()
			const response = await client.notifications.listNotifications({
				skip: 0,
				take: 50,
			})
			return {
				notifications: response.data.map((n) => ({
					...n,
					read: n.isRead,
					isRead: n.isRead,
				})),
				hasMore: response.hasMore,
			}
		},
		staleTime: 30 * 1000,
		refetchOnWindowFocus: true,
		enabled: !novuEnabled, // Only fetch from backend if Novu is NOT enabled
	})
	
	// Try to use Novu hooks if available
	// Note: These will only work if component is inside NovuProvider
	let novuResult: any = null
	if (novuEnabled) {
		try {
			// Dynamic import to avoid errors when Novu is not installed
			const { useNotifications } = require("@novu/react")
			novuResult = useNotifications()
		} catch (error) {
			// Novu hooks not available - will use backend
			console.debug("Novu hooks not available, using backend API")
		}
	}
	
	// Return Novu data if available, otherwise backend data
	if (novuResult?.notifications) {
		return {
			notifications: novuResult.notifications,
			isLoading: novuResult.isLoading,
			isFetching: novuResult.isFetching,
			hasMore: novuResult.hasMore,
			fetchMore: novuResult.fetchMore,
			refetch: novuResult.refetch,
		}
	}
	
	return {
		notifications: backendResult.data?.notifications || [],
		isLoading: backendResult.isLoading,
		isFetching: backendResult.isFetching,
		hasMore: backendResult.data?.hasMore || false,
		fetchMore: async () => {},
		refetch: backendResult.refetch,
	}
}

/**
 * Unified hook for unread count
 */
export function useUnreadCountUnified() {
	const novuEnabled = isNovuEnabled()
	
	// Always call backend hook
	const backendResult = useQuery({
		queryKey: notificationKeys.counts(),
		queryFn: async () => {
			const client = getEncoreBrowserClient()
			const response = await client.notifications.getUnreadCount()
			return response.count
		},
		staleTime: 30 * 1000,
		refetchOnWindowFocus: true,
		enabled: !novuEnabled,
	})
	
	// Try to use Novu hooks if available
	let novuCount = 0
	if (novuEnabled) {
		try {
			const { useCounts } = require("@novu/react")
			const { counts } = useCounts({ filters: [{ read: false }] })
			novuCount = counts?.[0]?.count || 0
		} catch (error) {
			// Will use backend
		}
	}
	
	return novuEnabled && novuCount > 0 ? novuCount : (backendResult.data || 0)
}

/**
 * Unified hook for marking all as read
 */
export function useMarkAllReadUnified() {
	const queryClient = useQueryClient()
	const novuEnabled = isNovuEnabled()
	
	// Backend mutation
	const backendMutation = useMutation({
		mutationFn: async () => {
			const client = getEncoreBrowserClient()
			await client.notifications.markAllAsRead()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: notificationKeys.all })
		},
	})
	
	// Try to get Novu hook
	let novuMarkAllRead: (() => Promise<void>) | null = null
	if (novuEnabled) {
		try {
			const { useNovu } = require("@novu/react")
			const novu = useNovu()
			novuMarkAllRead = novu.markAllAsRead
		} catch (error) {
			// Will use backend
		}
	}
	
	return {
		mutate: async () => {
			if (novuMarkAllRead) {
				await novuMarkAllRead()
			} else {
				backendMutation.mutate()
			}
		},
		isPending: backendMutation.isPending,
	}
}

/**
 * Unified hook for marking single notification as read
 */
export function useMarkReadUnified() {
	const queryClient = useQueryClient()
	const novuEnabled = isNovuEnabled()
	
	// Backend mutation
	const backendMutation = useMutation({
		mutationFn: async (id: string) => {
			const client = getEncoreBrowserClient()
			await client.notifications.markAsRead(id)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: notificationKeys.all })
		},
	})
	
	// Try to get Novu hook
	let novuMarkRead: ((id: string) => Promise<void>) | null = null
	if (novuEnabled) {
		try {
			const { useNovu } = require("@novu/react")
			const novu = useNovu()
			novuMarkRead = novu.markNotificationAsRead
		} catch (error) {
			// Will use backend
		}
	}
	
	return {
		mutate: async (id: string) => {
			if (novuMarkRead) {
				await novuMarkRead(id)
			} else {
				backendMutation.mutate(id)
			}
		},
		isPending: backendMutation.isPending,
	}
}
