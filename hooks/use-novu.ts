'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { post } from '@/lib/axios'
import type { ApiResponse } from '@/lib/types'

/**
 * Novu React Hooks
 *
 * Provides hooks for Novu integration in the dashboard.
 * The NovuInbox component handles its own data fetching.
 *
 * @see https://docs.novu.co/platform/quickstart/nextjs
 */

// ============================================
// Query Keys
// ============================================

export const novuKeys = {
  all: ['novu'] as const,
  subscriberHash: () => [...novuKeys.all, 'subscriber-hash'] as const,
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check if Novu is configured
 */
export function isNovuEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_NOVU_APP_ID
}

/**
 * Get Novu app ID
 */
export function getNovuAppId(): string | undefined {
  return process.env.NEXT_PUBLIC_NOVU_APP_ID
}

// ============================================
// Hooks
// ============================================

/**
 * Sync the current user as a Novu subscriber
 *
 * Call this after authentication to ensure the user exists in Novu.
 * This is typically done automatically in the auth flow.
 */
export function useSyncNovuSubscriber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => post<ApiResponse<{ subscriberId: string; synced: boolean }>>('/api/novu/sync-subscriber', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: novuKeys.subscriberHash() })
    },
  })
}
