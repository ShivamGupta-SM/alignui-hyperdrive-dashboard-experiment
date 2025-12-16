"use client"

import React, { useMemo, type ReactNode } from "react"
import { useSession } from "@/features/auth"
import { useOrganizations } from "@/features/organizations"
import type { organizations, auth } from "@/lib/api/encore-client"
import { OrganizationContext } from "./organization-context"

/**
 * Client-side Organization Provider Wrapper
 * This component uses hooks and is only rendered on client-side
 * It's dynamically imported to prevent Next.js from analyzing it during build
 */
export function ClientOrganizationProvider({ children }: { children: ReactNode }) {
	const { data: sessionData, isPending: isSessionPending } = useSession()
	const { data: organizationsData, isLoading: isLoadingOrgs, error: orgsError } = useOrganizations()

	const meUser = sessionData?.user as auth.MeResponse | undefined
	const activeOrgId = meUser?.activeOrganizationId

	const organization = useMemo(() => {
		if (!activeOrgId || !organizationsData?.organizations) return null
		return organizationsData.organizations.find(org => org.id === activeOrgId) || null
	}, [activeOrgId, organizationsData])

	const value = useMemo(
		() => {
			if (isSessionPending) {
				return {
					organization: null,
					organizationId: null,
					hasOrganization: false,
					isLoading: true,
					error: null,
				}
			}

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
