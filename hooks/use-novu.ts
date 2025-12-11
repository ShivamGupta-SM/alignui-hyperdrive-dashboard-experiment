'use client'

/**
 * Novu React Hooks
 *
 * Utility functions for Novu integration.
 * Main hooks (useNotifications, useCounts, useNovu) come from @novu/react.
 *
 * @see https://docs.novu.co/platform/inbox/react/headless
 */

// ============================================
// Query Keys
// ============================================

export const novuKeys = {
  all: ['novu'] as const,
  notifications: () => [...novuKeys.all, 'notifications'] as const,
  counts: () => [...novuKeys.all, 'counts'] as const,
  preferences: () => [...novuKeys.all, 'preferences'] as const,
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

/**
 * Get Novu API URL
 */
export function getNovuApiUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_NOVU_API_URL
}

/**
 * Get Novu WebSocket URL
 */
export function getNovuWsUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_NOVU_WS_URL
}
