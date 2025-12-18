"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useOrganizations, useSwitchOrganization } from "@/features/organizations"
import { useSession } from "@/features/auth"
import type { auth } from "@/lib/api/encore-client"

interface LayoutProps {
	children: React.ReactNode
}

/**
 * Organization Layout
 *
 * URL-based multi-tenancy: validates organizationId from URL params
 * and syncs with backend session when needed.
 *
 * Flow:
 * 1. Get organizationId from URL params
 * 2. Check if user has access to this organization
 * 3. Sync session if URL org differs from active org
 * 4. Redirect to /dashboard if invalid org
 */
export default function OrganizationLayout({ children }: LayoutProps) {
	const params = useParams<{ organizationId: string }>()
	const router = useRouter()
	const { data: orgsData, isPending: isLoadingOrgs } = useOrganizations()
	const { data: session } = useSession()
	const switchOrg = useSwitchOrganization()

	const organizations = orgsData?.organizations || []
	const organization = organizations.find(org => org.id === params.organizationId)
	// Type assertion for MeResponse which has activeOrganizationId
	const meUser = session?.user as auth.MeResponse | undefined
	const activeOrgId = meUser?.activeOrganizationId

	// URL → Session sync: keep backend session in sync with URL
	useEffect(() => {
		if (
			organization &&
			activeOrgId !== params.organizationId &&
			!switchOrg.isPending
		) {
			// Background sync - don't wait for it, don't show toast
			switchOrg.mutate(params.organizationId, {
				onSuccess: () => {
					// Silent success - no toast needed for background sync
				},
				onError: () => {
					// Silent error - URL is authoritative, session sync is best-effort
				}
			})
		}
	}, [organization, activeOrgId, params.organizationId, switchOrg])

	// Loading state
	if (isLoadingOrgs) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="animate-spin h-8 w-8 border-2 border-primary-base border-t-transparent rounded-full" />
			</div>
		)
	}

	// Invalid organization - redirect to dashboard root
	if (!organization) {
		router.push("/dashboard")
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-text-soft-400">Redirecting...</p>
			</div>
		)
	}

	return <>{children}</>
}
