'use client'

import { useQueryClient } from '@tanstack/react-query'

/**
 * Modern auth sync utility - React Query as single source of truth
 * No Zustand needed - React Query handles all state
 */
export function useAuthSync() {
  const queryClient = useQueryClient()

  /**
   * Sync auth state after successful sign in/up
   * Invalidates and refetches session query
   */
  const syncAuthState = async () => {
    // Invalidate and refetch session query
    await queryClient.invalidateQueries({ queryKey: ['session'] })
    await queryClient.refetchQueries({ queryKey: ['session'] })
  }

  /**
   * Clear auth state after sign out
   * Clears session query and all cache
   */
  const clearAuthState = async () => {
    // Clear session query
    queryClient.setQueryData(['session'], null)
    // Clear all cache
    queryClient.clear()
  }

  return {
    syncAuthState,
    clearAuthState,
  }
}
