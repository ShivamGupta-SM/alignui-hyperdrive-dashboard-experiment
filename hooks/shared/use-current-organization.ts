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
import type { OrganizationListItem } from "@/features/organizations/types"

export interface UseCurrentOrganizationReturn {
	/** Current organization from URL params */
	organization: OrganizationListItem | null
	/** Organization ID from URL params */
	organizationId: string
	/** Whether organization data is loading */
	isLoading: boolean
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
 */
export function useCurrentOrganization(): UseCurrentOrganizationReturn {
	const params = useParams<{ organizationId: string }>()
	const organizationId = params?.organizationId ?? ""

	const { data: orgsData, isLoading, error } = useOrganizations()

	// Memoize organizations array to prevent unnecessary re-renders
	const organizations = orgsData?.organizations ?? EMPTY_ORGANIZATIONS

	const organization = useMemo(() => {
		if (!organizationId || !organizations.length) return null
		return organizations.find((org) => org.id === organizationId) ?? null
	}, [organizationId, organizations])

	// Memoize the entire return object to ensure referential stability
	return useMemo(() => {
		const approvalStatus = organization?.approvalStatus

		return {
			organization,
			organizationId,
			isLoading,
			isApproved: approvalStatus === "approved",
			isPending: approvalStatus === "pending",
			isDraft: approvalStatus === "draft",
			isRejected: approvalStatus === "rejected",
			isBanned: approvalStatus === "banned",
			error: error as Error | null,
			organizations,
		}
	}, [organization, organizationId, isLoading, error, organizations])
}

/**
 * Hook to check if user can perform actions that require approved organization
 */
export function useCanPerformActions(): boolean {
	const { isApproved } = useCurrentOrganization()
	return isApproved
}
