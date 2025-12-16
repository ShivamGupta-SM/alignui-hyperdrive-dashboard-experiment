"use client"

import { useOrganizationContext } from "@/contexts/organization-context"

/**
 * Hook to get active organization
 * Simplified: Uses organization context directly instead of taking organizations as param
 * 
 * @returns Current active organization or null
 */
export function useActiveOrganization() {
	const { organization } = useOrganizationContext()
	return organization
}

/**
 * Hook to get active organization ID
 * Simplified: Uses organization context directly
 */
export function useActiveOrganizationId(): string | null {
	const { organizationId } = useOrganizationContext()
	return organizationId
}
