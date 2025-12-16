"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { useSession } from "@/hooks/use-session"
import { useOrganizations } from "@/hooks/use-organizations"
import type { auth } from "@/lib/encore-client"

/**
 * Organization Context
 * Simplified: Derives organization from session + organizations list
 * No separate API call - uses React Query data from useOrganizations hook
 */
interface OrganizationContextValue {
	organization: auth.OrganizationResponse | null
	organizationId: string | null
	hasOrganization: boolean
	isLoading: boolean
	error: Error | null
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined)

/**
 * Organization Provider
 * Simplified: Uses React Query hooks directly, no redundant fetching
 */
export function OrganizationProvider({ children }: { children: ReactNode }) {
	const { data: sessionData, isPending: isSessionPending } = useSession()
	const { data: organizationsData, isLoading: isLoadingOrgs, error: orgsError } = useOrganizations()
	
	const meUser = sessionData?.user as auth.MeResponse | undefined
	const activeOrgId = meUser?.activeOrganizationId

	// Derive organization from organizations list (already fetched by useOrganizations)
	const organization = useMemo(() => {
		if (!activeOrgId || !organizationsData?.organizations) return null
		return organizationsData.organizations.find(org => org.id === activeOrgId) || null
	}, [activeOrgId, organizationsData])

	// Industry Standard: Explicit loading state handling
	// Wait for session to load before determining hasOrganization
	const value: OrganizationContextValue = useMemo(
		() => {
			// If session is still loading, return loading state
			// This prevents hasOrganization from being false during initial load
			if (isSessionPending) {
				return {
					organization: null,
					organizationId: null,
					hasOrganization: false,
					isLoading: true,
					error: null,
				}
			}
			
			// Session loaded, now safe to determine organization state
			return {
				organization: organization || null,
				organizationId: activeOrgId || null,
				hasOrganization: !!activeOrgId,
				isLoading: isLoadingOrgs,
				error: orgsError as Error | null,
			}
		},
		[organization, activeOrgId, isSessionPending, isLoadingOrgs, orgsError]
	)

	return (
		<OrganizationContext.Provider value={value}>
			{children}
		</OrganizationContext.Provider>
	)
}

/**
 * Hook to access organization context
 */
export function useOrganizationContext() {
	const context = useContext(OrganizationContext)
	
	if (context === undefined) {
		throw new Error("useOrganizationContext must be used within OrganizationProvider")
	}
	
	return context
}

/**
 * Simplified hook for boolean check
 */
export function useHasOrganization() {
	const { hasOrganization } = useOrganizationContext()
	return hasOrganization
}

/**
 * Hook to get organization ID (with null safety)
 */
export function useOrganizationId(): string | null {
	const { organizationId } = useOrganizationContext()
	return organizationId
}


