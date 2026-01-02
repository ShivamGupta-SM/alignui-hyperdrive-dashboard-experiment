/**
 * Onboarding Status Hook
 *
 * Determines navigation state based on user's organizations.
 *
 * ✅ REFACTORED: Flattened state machine from 2 enums to 1
 * Previously: OnboardingState + OnboardingSubState
 * Now: Single OnboardingState covers all cases
 */

"use client"

import { useMemo } from "react"
import { useOrganization } from "./use-organizations"
import type { Organization } from "../types"

// =============================================================================
// Types - Flattened State Machine
// =============================================================================

/**
 * Single-level onboarding state (no more subState)
 *
 * States that need user action:
 * - no_orgs: New user, needs to create org
 * - has_draft: Has incomplete org, needs to complete form
 * - has_rejected: Org rejected, needs to fix and resubmit
 *
 * States that are waiting:
 * - loading: Fetching data
 * - has_pending: Waiting for admin approval
 * - has_banned: Account suspended
 *
 * Terminal states:
 * - ready: Has approved org, can access dashboard
 * - error: Network/API error
 */
export type OnboardingState =
	| "loading"       // Fetching data
	| "error"         // Network/API error
	| "no_orgs"       // New user - create first org
	| "has_draft"     // Incomplete org - complete form
	| "has_pending"   // Waiting for approval
	| "has_rejected"  // Rejected - fix and resubmit
	| "has_banned"    // Account banned
	| "ready"         // Approved - can access dashboard

/**
 * @deprecated Use `OnboardingState` directly. Kept for backwards compatibility.
 * Will be removed in future version.
 */
export type OnboardingSubState =
	| "no_orgs"
	| "has_draft"
	| "has_pending"
	| "has_rejected"
	| "has_banned"

export interface OnboardingStatus {
	/** Current onboarding state */
	state: OnboardingState
	/**
	 * @deprecated Use `state` directly. This is now always null.
	 * Kept for backwards compatibility during migration.
	 */
	subState: OnboardingSubState | null
	/** Whether data is loading */
	isLoading: boolean
	/** Whether user needs to complete onboarding */
	needsOnboarding: boolean
	/** Whether user can access dashboard */
	canAccessDashboard: boolean
	/** ID of approved org (if any) */
	approvedOrgId: string | null
	/** ID of target org to work with */
	targetOrgId: string | null
	/** Rejection reason (if rejected/banned) */
	rejectionReason: string | null
	/** Manual refetch function */
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
		isInitialLoading,
		isRefetching,
		isOrgsError,
		isSessionError,
		refetch,
	} = useOrganization()

	return useMemo(() => {
		// Loading state - check both isInitialLoading AND isRefetching to prevent redirect loops
		if (isInitialLoading || isRefetching) {
			return {
				state: "loading" as const,
				subState: null, // @deprecated - kept for backwards compatibility
				isLoading: true,
				needsOnboarding: false,
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
				state: "error" as const,
				subState: null,
				isLoading: false,
				needsOnboarding: false,
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
				state: "no_orgs" as const,
				subState: "no_orgs" as const, // @deprecated
				isLoading: false,
				needsOnboarding: true,
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
				state: "ready" as const,
				subState: null,
				isLoading: false,
				needsOnboarding: false,
				canAccessDashboard: true,
				approvedOrgId: approvedOrg.id,
				targetOrgId: approvedOrg.id,
				rejectionReason: null,
				refetch,
			}
		}

		// Determine target org based on priority: pending > draft > rejected > banned
		const targetOrg = pendingOrg || draftOrg || orgsArray[0]
		const targetOrgId = targetOrg?.id || null
		const approvalStatus = targetOrg?.approvalStatus

		// Cast to get rejectionReason
		const org = targetOrg as Organization | null | undefined

		// ✅ FIX: Direct comparison instead of STATUS_CHECKS (cleaner, more readable)
		let state: OnboardingState = "has_draft"
		let rejectionReason: string | null = null

		if (approvalStatus === "pending") {
			state = "has_pending"
		} else if (approvalStatus === "rejected") {
			state = "has_rejected"
			rejectionReason = org?.rejectionReason || null
		} else if (approvalStatus === "banned") {
			state = "has_banned"
			rejectionReason = org?.rejectionReason || null
		} else if (approvalStatus === "draft") {
			state = "has_draft"
		}

		return {
			state,
			subState: state as OnboardingSubState, // @deprecated - mirrors state for compatibility
			isLoading: false,
			needsOnboarding: true,
			canAccessDashboard: false,
			approvedOrgId: null,
			targetOrgId,
			rejectionReason,
			refetch,
		}
	}, [isInitialLoading, isRefetching, isSessionError, isOrgsError, organizations, approvedOrg, pendingOrg, draftOrg, refetch])
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get redirect URL based on onboarding status
 * Uses flattened state machine (no more subState checks)
 */
export function getRedirectUrl(status: OnboardingStatus): string | null {
	switch (status.state) {
		case "loading":
		case "error":
			return null
		case "ready":
			return status.approvedOrgId ? `/dashboard/${status.approvedOrgId}` : null
		case "has_pending":
			return ONBOARDING_ROUTES.pending
		case "has_banned":
			return ONBOARDING_ROUTES.banned
		case "no_orgs":
		case "has_draft":
		case "has_rejected":
			return ONBOARDING_ROUTES.form
		default:
			return null
	}
}

/**
 * Get user-friendly message for current state
 * Uses flattened state machine (no more subState checks)
 */
export function getOnboardingMessage(status: OnboardingStatus): string {
	switch (status.state) {
		case "loading":
			return "Loading..."
		case "error":
			return "Something went wrong. Please try again."
		case "ready":
			return "Welcome back!"
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

