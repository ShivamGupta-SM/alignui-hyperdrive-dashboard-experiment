/**
 * Organizations React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import { STALE_TIME } from "@/lib/utils/query-config"
import { getErrorMessage } from "@/lib/utils/format"
import { useSession } from "@/features/auth"
import { toast } from "sonner"
import * as actions from "../actions/organizations"
import type { organizations } from "@/lib/api/encore-client"

// Use Encore types directly - single source of truth
type Organization = organizations.Organization
type UpdateOrganizationInput = organizations.UpdateOrganizationRequest & { id?: string }

// ============================================
// Client Instance
// ============================================
const client = getEncoreBrowserClient()

// ============================================
// Query Keys
// ============================================
export const organizationKeys = {
	all: ["organizations"] as const,
	lists: () => [...organizationKeys.all, "list"] as const,
	detail: (id: string) => [...organizationKeys.all, "detail", id] as const,
	stats: (id: string) => [...organizationKeys.all, "stats", id] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * Get user's organizations
 */
export function useOrganizations() {
	return useQuery({
		queryKey: organizationKeys.lists(),
		queryFn: async () => {
			const result = await client.auth.listOrganizations()
			return { organizations: result.organizations || [] }
		},
		staleTime: STALE_TIME.MEDIUM,
		retry: false,
		refetchOnWindowFocus: true,
	})
}

/**
 * Get organization by ID
 */
export function useOrganizationById(id: string) {
	return useQuery({
		queryKey: organizationKeys.detail(id),
		queryFn: () => client.organizations.getOrganization(id),
		enabled: !!id,
		staleTime: STALE_TIME.MEDIUM,
	})
}

/**
 * Get active organization (from session)
 */
export function useActiveOrganization() {
	const { data: session, isPending } = useSession()
	const activeOrgId = (session?.user as { activeOrganizationId?: string } | undefined)?.activeOrganizationId

	const query = useQuery({
		queryKey: organizationKeys.detail(activeOrgId || ""),
		queryFn: () => (activeOrgId ? client.organizations.getOrganization(activeOrgId) : null),
		enabled: !!activeOrgId && !isPending,
		staleTime: STALE_TIME.MEDIUM,
	})

	return {
		...query,
		activeOrgId,
		isSessionPending: isPending,
	}
}

/**
 * Comprehensive organization hook with all mutations
 */
export function useOrganization() {
	const queryClient = useQueryClient()
	const { data: session, isPending: isSessionPending } = useSession()
	const activeOrgId = (session?.user as { activeOrganizationId?: string } | undefined)?.activeOrganizationId

	// Active organization query
	const {
		data: organization,
		isPending: isPendingOrg,
		refetch: refetchOrg,
	} = useQuery({
		queryKey: organizationKeys.detail(activeOrgId || ""),
		queryFn: () => (activeOrgId ? client.organizations.getOrganization(activeOrgId) : null),
		enabled: !!activeOrgId && !isSessionPending,
		staleTime: STALE_TIME.MEDIUM,
	})

	// All organizations query
	const {
		data: organizationsData,
		isLoading: isLoadingOrgs,
		refetch: refetchOrgs,
	} = useQuery({
		queryKey: organizationKeys.lists(),
		queryFn: async () => {
			const result = await client.auth.listOrganizations()
			return result.organizations || []
		},
		enabled: !isSessionPending && !!session?.user,
		staleTime: STALE_TIME.MEDIUM,
	})

	const organizations = organizationsData as Organization[] | undefined

	// Create organization
	const createMutation = useMutation({
		mutationFn: async (name: string) => {
			const { createBasicOrganization } = await import("../actions/organizations")
			const result = await createBasicOrganization({ name })
			if (!result?.data) throw new Error("Failed to create organization")
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.all })
			toast.success("Organization created")
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Failed to create organization"))
		},
	})

	// Update organization
	const updateMutation = useMutation({
		mutationFn: async (data: UpdateOrganizationInput) => {
			return client.organizations.updateOrganization(data.id || activeOrgId || "", data)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.detail(activeOrgId || "") })
		},
	})

	// Verify GST
	const verifyGSTMutation = useMutation({
		mutationFn: async ({ gstNumber, orgId }: { gstNumber: string; orgId?: string }) => {
			const { verifyGST } = await import("../actions/onboarding")
			const result = await verifyGST({ gstNumber, organizationId: orgId || activeOrgId || "" })
			if (!result?.data) throw new Error("GST verification failed")
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.detail(activeOrgId || "") })
			toast.success("GST verified successfully")
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "GST verification failed"))
		},
	})

	// Submit for approval
	const submitMutation = useMutation({
		mutationFn: async (orgId: string) => {
			const { submitOrganizationForApproval } = await import("../actions/approval")
			const result = await submitOrganizationForApproval({ organizationId: orgId })
			if (!result?.data?.success) throw new Error("Submission failed")
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.detail(activeOrgId || "") })
			toast.success("Submitted for approval")
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Submission failed"))
		},
	})

	// Resubmit after rejection
	const resubmitMutation = useMutation({
		mutationFn: async (orgId: string) => {
			const { resubmitOrganizationForApproval } = await import("../actions/approval")
			const result = await resubmitOrganizationForApproval({ organizationId: orgId })
			if (!result?.data?.success) throw new Error("Resubmit failed")
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.detail(activeOrgId || "") })
			toast.success("Reset to draft - you can now edit and resubmit")
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Resubmit failed"))
		},
	})

	// Derived state
	const isPending = isSessionPending || isPendingOrg
	const hasApprovedOrg = organizations?.some((org) => org.approvalStatus === "approved") ?? false
	const hasDraftOrg =
		organizations?.some((org) => org.approvalStatus === "draft" || org.approvalStatus === "pending") ?? false
	const draftOrg = organizations?.find(
		(org) => org.approvalStatus === "draft" || org.approvalStatus === "pending"
	)

	// Status flags for current organization
	const org = organization as Organization | null | undefined
	const isDraft = org?.approvalStatus === "draft"
	const isApprovalPending = org?.approvalStatus === "pending"
	const isApproved = org?.approvalStatus === "approved"
	const isRejected = org?.approvalStatus === "rejected"
	const isBanned = org?.approvalStatus === "banned"
	const isGSTVerified = org?.gstVerified ?? false
	const needsOnboarding = !hasApprovedOrg

	return {
		// Data
		organization: org,
		organizations,
		activeOrgId,

		// Derived
		hasApprovedOrg,
		hasDraftOrg,
		draftOrg,
		needsOnboarding,

		// Status flags (approval)
		isDraft,
		isApprovalPending,
		isApproved,
		isRejected,
		isBanned,
		isGSTVerified,

		// Loading States
		isPending,
		isLoading: isPending, // Alias for backwards compatibility
		isPendingOrgs: isLoadingOrgs,
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		isVerifyingGST: verifyGSTMutation.isPending,
		isSubmitting: submitMutation.isPending,
		isResubmitting: resubmitMutation.isPending,

		// Actions
		create: createMutation.mutateAsync,
		update: updateMutation.mutateAsync,
		verifyGST: verifyGSTMutation.mutateAsync,
		submit: submitMutation.mutateAsync,
		resubmit: resubmitMutation.mutateAsync,

		// Refetch
		refetch: () => {
			refetchOrg()
			refetchOrgs()
		},
	}
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Switch active organization
 */
export function useSwitchOrganization() {
	const queryClient = useQueryClient()
	const router = useRouter()

	return useMutation({
		mutationFn: (organizationId: string) => actions.switchOrganization({ organizationId }),
		onMutate: async (organizationId) => {
			await queryClient.cancelQueries({ queryKey: ["auth", "session"] })
			const previousSession = queryClient.getQueryData(["auth", "session"])
			queryClient.setQueryData(["auth", "session"], (old: unknown) => {
				if (!old) return old
				const oldData = old as { user?: { activeOrganizationId?: string } }
				return {
					...oldData,
					user: {
						...oldData.user,
						activeOrganizationId: organizationId,
					},
				}
			})
			return { previousSession }
		},
		onError: (err, _, context) => {
			if (context?.previousSession) {
				queryClient.setQueryData(["auth", "session"], context.previousSession)
			}
			toast.error("Failed to switch organization", {
				description: getErrorMessage(err, "An unexpected error occurred"),
			})
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["auth", "session"] })
			await queryClient.refetchQueries({ queryKey: ["auth", "session"] })
			queryClient.invalidateQueries()
			router.refresh()
			toast.success("Organization switched successfully")
		},
	})
}

// ============================================
// Helper Hooks
// ============================================

/**
 * Check if user needs onboarding
 */
export function useNeedsOnboarding() {
	const { hasApprovedOrg, hasDraftOrg, isPending, isPendingOrgs } = useOrganization()

	return {
		needsOnboarding: !hasApprovedOrg,
		hasDraft: hasDraftOrg,
		isPending: isPending || isPendingOrgs,
	}
}

/**
 * Organization status checks
 */
export function useOrganizationStatus() {
	const { organization, isPending } = useOrganization()

	return {
		status: organization?.approvalStatus ?? null,
		isDraft: organization?.approvalStatus === "draft",
		isApprovalPending: organization?.approvalStatus === "pending",
		isApproved: organization?.approvalStatus === "approved",
		isRejected: organization?.approvalStatus === "rejected",
		isSuspended: organization?.approvalStatus === "banned",
		isGSTVerified: organization?.gstVerified ?? false,
		isPending,
	}
}

