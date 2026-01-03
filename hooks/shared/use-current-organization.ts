/**
 * useCurrentOrganization Hook
 *
 * @description
 * SSOT hook for getting the current organization from URL params.
 * Centralizes organization fetching logic that was previously duplicated
 * across dashboard, campaigns, enrollments, and sidebar components.
 *
 * @example
 * ```tsx
 * const { organization, organizationId, isLoading, isApproved, error } = useCurrentOrganization()
 * ```
 */

"use client"

import { useParams } from "next/navigation"
import { useMemo } from "react"
import { useOrganizations } from "@/features/organizations/hooks/use-organizations"
import { useSession } from "@/features/auth"
import type { OrganizationListItem } from "@/features/organizations/types"

export interface UseCurrentOrganizationReturn {
	/** Current organization from URL params */
	organization: OrganizationListItem | null
	/** Organization ID from URL params */
	organizationId: string
	/** Whether organization data is loading (considers session + orgs) */
	isLoading: boolean
	/** Whether initial load is complete */
	isInitialLoading: boolean
	/** Whether organization is approved */
	isApproved: boolean
	/** Whether organization is pending approval */
	isPending: boolean
	/** Whether organization is in draft state */
	isDraft: boolean
	/** Whether organization is rejected */
	isRejected: boolean
	/** Whether organization is banned */
	isBanned: boolean
	/** Error if any */
	error: Error | null
	/** All organizations for the user */
	organizations: OrganizationListItem[]
}

// Empty array constant to avoid creating new reference on each render
const EMPTY_ORGANIZATIONS: OrganizationListItem[] = []

/**
 * Hook to get the current organization based on URL params
 * Centralizes organization lookup logic for all dashboard pages
 *
 * ✅ FIX: Considers both session AND organizations loading state
 * to prevent race condition where orgId is available but orgs aren't loaded yet
 */
export function useCurrentOrganization(): UseCurrentOrganizationReturn {
	const params = useParams<{ organizationId: string }>()
	const organizationId = params?.organizationId ?? ""

	// ✅ FIX: Track session loading state to prevent race condition
	const { isPending: isSessionPending } = useSession()
	const { data: orgsData, isPending: isOrgsLoading, error } = useOrganizations()

	// Memoize organizations array to prevent unnecessary re-renders
	const organizations = orgsData?.organizations ?? EMPTY_ORGANIZATIONS

	const organization = useMemo(() => {
		if (!organizationId || !organizations.length) return null
		return organizations.find((org) => org.id === organizationId) ?? null
	}, [organizationId, organizations])

	// Memoize the entire return object to ensure referential stability
	return useMemo(() => {
		const approvalStatus = organization?.approvalStatus

		// ✅ FIX: Composite loading state - considers both session AND orgs
		// This prevents "org not found" flash when session is loading
		const isInitialLoading = isSessionPending || isOrgsLoading
		const isLoading = isInitialLoading

		return {
			organization,
			organizationId,
			isLoading,
			isInitialLoading,
			// ✅ FIX: Direct comparison instead of STATUS_CHECKS utility (cleaner)
			isApproved: approvalStatus === "approved",
			isPending: approvalStatus === "pending",
			isDraft: approvalStatus === "draft",
			isRejected: approvalStatus === "rejected",
			isBanned: approvalStatus === "banned",
			error: error as Error | null,
			organizations,
		}
	}, [organization, organizationId, isSessionPending, isOrgsLoading, error, organizations])
}
