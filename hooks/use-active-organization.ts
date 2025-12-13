'use client'

import { useMemo } from 'react'
import { useSession } from './use-session'
import type { Organization } from './use-organizations'

/**
 * Modern hook to get active organization
 * Uses React Query session as single source of truth
 * 
 * @param organizations - List of user organizations
 * @returns Current active organization or null
 * 
 * Features:
 * - Derives from session.activeOrganizationId
 * - Automatically updates when session changes
 * - No redundant state management
 */
export function useActiveOrganization(
  organizations: Organization[]
): Organization | null {
  const { data: sessionData } = useSession()
  const activeOrgId = sessionData?.user?.activeOrganizationId

  return useMemo(() => {
    if (activeOrgId) {
      return organizations.find(org => org.id === activeOrgId) ?? null
    }
    return organizations[0] ?? null
  }, [organizations, activeOrgId])
}

/**
 * Hook to get active organization ID
 * Convenience hook for when you only need the ID
 */
export function useActiveOrganizationId(): string | null {
  const { data: sessionData } = useSession()
  return sessionData?.user?.activeOrganizationId ?? null
}
