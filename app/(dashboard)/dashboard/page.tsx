"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useOrganizations } from "@/features/organizations"
import { useSession } from "@/features/auth"
import type { auth } from "@/lib/api/encore-client"

/**
 * Dashboard Root Page
 *
 * URL-based multi-tenancy: redirects to /dashboard/[organizationId]
 *
 * Flow:
 * 1. Check if user has any organizations
 * 2. Redirect to active org or first org in list
 * 3. If no orgs, redirect to onboarding
 */
export default function DashboardRootPage() {
	const router = useRouter()
	const { data: orgsData, isPending: isLoadingOrgs } = useOrganizations()
	const { data: session, isPending: isLoadingSession } = useSession()

	const organizations = orgsData?.organizations || []
	// Type assertion for MeResponse which has activeOrganizationId
	const meUser = session?.user as auth.MeResponse | undefined
	const activeOrgId = meUser?.activeOrganizationId

	useEffect(() => {
		// Wait for data to load
		if (isLoadingOrgs || isLoadingSession) return

		// No organizations - redirect to onboarding
		if (organizations.length === 0) {
			router.push("/onboarding")
			return
		}

		// Redirect to active org or first org
		const targetOrg = organizations.find(o => o.id === activeOrgId) || organizations[0]
		router.push(`/dashboard/${targetOrg.id}`)
	}, [organizations, activeOrgId, isLoadingOrgs, isLoadingSession, router])

	// Loading state
	return (
		<div className="flex h-full items-center justify-center min-h-[50vh]">
			<div className="flex flex-col items-center gap-3">
				<div className="animate-spin h-8 w-8 border-2 border-primary-base border-t-transparent rounded-full" />
				<p className="text-text-soft-400 text-sm">Loading...</p>
			</div>
		</div>
	)
}
