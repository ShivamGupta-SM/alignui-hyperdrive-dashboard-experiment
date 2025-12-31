"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { useOrganizations } from "@/features/organizations"

interface LayoutProps {
	children: React.ReactNode
}

/**
 * Organization Layout - Better Auth Standard Pattern
 *
 * Following Better Auth official recommendation:
 * "You can manage the active organization in the client side only."
 *
 * ✅ URL is source of truth (no session sync needed)
 * ✅ Client-side context only (zero database writes)
 * ✅ Zero race conditions (no async mutations)
 * ✅ Multi-tab support (each tab independent)
 * ✅ Simple validation (access check only)
 *
 * Flow:
 * 1. Get organizationId from URL params
 * 2. Validate user has access to this organization
 * 3. Redirect if invalid/non-approved org
 * 4. Render children with organization context
 */
export default function OrganizationLayout({ children }: LayoutProps) {
	const params = useParams<{ organizationId: string }>()
	const router = useRouter()
	const { data: orgsData, isPending: isLoadingOrgs } = useOrganizations()
	const [isRedirecting, setIsRedirecting] = useState(false)

	const organizations = orgsData?.organizations || []
	const organization = organizations.find(org => org.id === params.organizationId)

	// Compute redirect target - pure function, no side effects
	const redirectTarget = useMemo(() => {
		if (isLoadingOrgs || isRedirecting) return null

		// Org exists - check approval status
		if (organization) {
			const status = organization.approvalStatus
			if (status === "draft" || status === "rejected") return "/onboarding"
			if (status === "pending") return "/onboarding/pending"
			if (status === "banned") return "/onboarding/banned"
			// Approved - no redirect needed
			return null
		}

		// Org doesn't exist in user's list - find best redirect
		if (organizations.length === 0) {
			return "/onboarding"
		}

		// Find first approved org, or go to onboarding
		const approvedOrg = organizations.find(o => o.approvalStatus === "approved")
		if (approvedOrg) {
			return `/dashboard/${approvedOrg.id}`
		}

		// Has orgs but none approved
		const pendingOrg = organizations.find(o => o.approvalStatus === "pending")
		if (pendingOrg) return "/onboarding/pending"

		return "/onboarding"
	}, [isLoadingOrgs, isRedirecting, organization, organizations])

	// Handle redirects
	useEffect(() => {
		if (redirectTarget && !isRedirecting) {
			setIsRedirecting(true)
			router.replace(redirectTarget)
		}
	}, [redirectTarget, isRedirecting, router])

	// Loading state
	if (isLoadingOrgs) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="animate-spin h-8 w-8 border-2 border-primary-base border-t-transparent rounded-full" />
			</div>
		)
	}

	// Redirecting - show message
	if (redirectTarget || !organization || organization.approvalStatus !== "approved") {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-text-soft-400">Redirecting...</p>
			</div>
		)
	}

	// URL is source of truth - no context wrapper needed
	// Components use useParams() directly for organizationId
	return <>{children}</>
}
