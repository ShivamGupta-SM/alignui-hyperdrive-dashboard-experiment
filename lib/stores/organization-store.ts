'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Organization } from '@/hooks/use-organizations'

interface OrganizationState {
  // Current active organization
  activeOrganization: Organization | null
  activeOrganizationId: string | null
  
  // All user organizations
  organizations: Organization[]
  
  // Actions
  setActiveOrganization: (org: Organization) => void
  setActiveOrganizationId: (orgId: string | null) => void
  setOrganizations: (orgs: Organization[]) => void
  clearOrganization: () => void
}

/**
 * Organization store using Zustand
 * Manages active organization state globally
 */
export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      // Initial state
      activeOrganization: null,
      activeOrganizationId: null,
      organizations: [],

      // Actions
      setActiveOrganization: (org) =>
        set({
          activeOrganization: org,
          activeOrganizationId: org.id,
        }),

      setActiveOrganizationId: (orgId) =>
        set({
          activeOrganizationId: orgId,
          // Update activeOrganization if we have it in organizations list
          activeOrganization: null, // Will be set by setOrganizations
        }),

      setOrganizations: (orgs) =>
        set((state) => {
          // If we have an activeOrganizationId, find and set the active org
          const activeOrg = state.activeOrganizationId
            ? orgs.find((org) => org.id === state.activeOrganizationId)
            : orgs[0] || null

          return {
            organizations: orgs,
            activeOrganization: activeOrg || state.activeOrganization,
            activeOrganizationId: activeOrg?.id || state.activeOrganizationId,
          }
        }),

      clearOrganization: () =>
        set({
          activeOrganization: null,
          activeOrganizationId: null,
        }),
    }),
    {
      name: 'organization-storage',
      partialize: (state) => ({
        activeOrganizationId: state.activeOrganizationId,
        // Don't persist full organization objects - fetch fresh
      }),
    }
  )
)
