'use client'

import { useQuery } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { integrations } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'

// Re-export types from Encore for convenience
export type Platform = integrations.Platform

// ============================================
// Query Keys
// ============================================

export const platformKeys = {
  all: ['platforms'] as const,
  lists: () => [...platformKeys.all, 'list'] as const,
  list: () => [...platformKeys.lists()] as const,
  active: () => [...platformKeys.all, 'active'] as const,
  details: () => [...platformKeys.all, 'detail'] as const,
  detail: (id: string) => [...platformKeys.details(), id] as const,
  byName: (name: string) => [...platformKeys.all, 'name', name] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch all platforms
 */
export function usePlatforms(page = 1, limit = 50) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: platformKeys.list(),
    queryFn: () => client.integrations.listPlatforms({
      skip: (page - 1) * limit,
      take: limit,
    }),
    staleTime: STALE_TIMES.STATIC, // Platforms rarely change
  })
}

/**
 * Fetch active platforms only
 */
export function useActivePlatforms() {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: platformKeys.active(),
    queryFn: async () => {
      const result = await client.integrations.listActivePlatforms()
      return result.platforms
    },
    staleTime: STALE_TIMES.STATIC,
  })
}

/**
 * Fetch single platform by ID
 */
export function usePlatform(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: platformKeys.detail(id),
    queryFn: () => client.integrations.getPlatform(id),
    enabled: !!id,
    staleTime: STALE_TIMES.STATIC,
  })
}

/**
 * Fetch platform by name/slug
 */
export function usePlatformByName(name: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: platformKeys.byName(name),
    queryFn: () => client.integrations.getPlatformByName(name),
    enabled: !!name,
    staleTime: STALE_TIMES.STATIC,
  })
}
