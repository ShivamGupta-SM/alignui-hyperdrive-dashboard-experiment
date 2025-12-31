/**
 * Onboarding Status Hook
 *
 * Determines navigation state based on user's organizations.
 */

"use client"

import { useMemo } from "react"
import { useOrganization } from "./use-organizations"
import { STATUS_CHECKS } from "@/lib/utils/validations"
import type { Organization } from "../types"

// =============================================================================
// Types
// =============================================================================

export type OnboardingState =
	| "loading"           // Still fetching data
	| "error"             // Network/API error
	| "needs_onboarding"  // No approved org
	| "ready"             // Has approved org - can access dashboard

export type OnboardingSubState =
	| "no_orgs"           // Create first org
	| "has_draft"         // Complete form
	| "has_pending"       // Waiting for approval
	| "has_rejected"      // Fix and resubmit
	| "has_banned"        // Account banned - contact support

export interface OnboardingStatus {
	state: OnboardingState
	subState: OnboardingSubState | null
	isLoading: boolean
	canAccessDashboard: boolean
	approvedOrgId: string | null
	targetOrgId: string | null
	rejectionReason: string | null
	refetch: () => void
}

// =============================================================================
// Routes
// =============================================================================

export const ONBOARDING_ROUTES = {
	form: "/onboarding",
	pending: "/onboarding/pending",
	banned: "/onboarding/banned",
	dashboard: "/dashboard",
} as const

// =============================================================================
// Hook
// =============================================================================

export function useOnboardingStatus(): OnboardingStatus {
	const {
		organizations,
		approvedOrg,
		pendingOrg,
		draftOrg,
		isPending,
		isFetching,
		isOrgsError,
		isSessionError,
		refetch,
	} = useOrganization()

	return useMemo(() => {
		// Loading state - check both isPending AND isFetching to prevent redirect loops
		// isPending = initial load, isFetching = refetch/invalidation
		if (isPending || isFetching) {
			return {
				state: "loading",
				subState: null,
				isLoading: true,
				canAccessDashboard: false,
				approvedOrgId: null,
				targetOrgId: null,
				rejectionReason: null,
				refetch,
			}
		}

		// Error state
		if (isSessionError || isOrgsError) {
			return {
				state: "error",
				subState: null,
				isLoading: false,
				canAccessDashboard: false,
				approvedOrgId: null,
				targetOrgId: null,
				rejectionReason: null,
				refetch,
			}
		}

		// No orgs at all = new user, needs onboarding
		const orgsArray = Array.isArray(organizations) ? organizations : []
		if (orgsArray.length === 0) {
			return {
				state: "needs_onboarding",
				subState: "no_orgs",
				isLoading: false,
				canAccessDashboard: false,
				approvedOrgId: null,
				targetOrgId: null,
				rejectionReason: null,
				refetch,
			}
		}

		// Has approved org = ready for dashboard
		if (approvedOrg) {
			return {
				state: "ready",
				subState: null,
				isLoading: false,
				canAccessDashboard: true,
				approvedOrgId: approvedOrg.id,
				targetOrgId: approvedOrg.id,
				rejectionReason: null,
				refetch,
			}
		}

		// Determine target org and sub-state based on priority: pending > draft > rejected > banned
		// Find the "best" org to show/work with
		const targetOrg = pendingOrg || draftOrg || orgsArray[0]
		const targetOrgId = targetOrg?.id || null
		const approvalStatus = targetOrg?.approvalStatus

		let subState: OnboardingSubState = "has_draft"
		let rejectionReason: string | null = null

		// Cast to get rejectionReason
		const org = targetOrg as Organization | null | undefined

		// SSOT: Using STATUS_CHECKS helpers from @/lib/utils/validations
		if (STATUS_CHECKS.isPending(approvalStatus)) {
			subState = "has_pending"
		} else if (STATUS_CHECKS.isRejected(approvalStatus)) {
			subState = "has_rejected"
			rejectionReason = org?.rejectionReason || null
		} else if (STATUS_CHECKS.isBanned(approvalStatus)) {
			subState = "has_banned"
			rejectionReason = org?.rejectionReason || null
		} else if (STATUS_CHECKS.isDraft(approvalStatus)) {
			subState = "has_draft"
		}

		return {
			state: "needs_onboarding",
			subState,
			isLoading: false,
			canAccessDashboard: false,
			approvedOrgId: null,
			targetOrgId,
			rejectionReason,
			refetch,
		}
	}, [isPending, isFetching, isSessionError, isOrgsError, organizations, approvedOrg, pendingOrg, draftOrg, refetch])
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get redirect URL based on onboarding status
 */
export function getRedirectUrl(status: OnboardingStatus): string | null {
	if (status.isLoading) return null
	if (status.state === "error") return null

	if (status.state === "ready" && status.approvedOrgId) {
		return `/dashboard/${status.approvedOrgId}`
	}

	if (status.state === "needs_onboarding") {
		if (status.subState === "has_pending") {
			return ONBOARDING_ROUTES.pending
		}
		if (status.subState === "has_banned") {
			return ONBOARDING_ROUTES.banned
		}
		return ONBOARDING_ROUTES.form
	}

	return null
}

/**
 * Get user-friendly message for current state
 */
export function getOnboardingMessage(status: OnboardingStatus): string {
	if (status.state === "loading") return "Loading..."
	if (status.state === "error") return "Something went wrong. Please try again."
	if (status.state === "ready") return "Welcome back!"

	// needs_onboarding sub-states
	switch (status.subState) {
		case "no_orgs":
			return "Let's set up your organization"
		case "has_draft":
			return "Complete your organization setup"
		case "has_pending":
			return "Your application is under review"
		case "has_rejected":
			return "Your application needs attention"
		case "has_banned":
			return "Your account has been suspended"
		default:
			return ""
	}
}

