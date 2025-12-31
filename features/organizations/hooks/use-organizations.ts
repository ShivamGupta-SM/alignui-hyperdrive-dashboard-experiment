/**
 * Organizations React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/api/client"
import { STALE_TIME, GC_TIME, PAGE_SIZE, DEFAULT_RETRY_CONFIG, createMutationErrorHandler, createGlobalQueryKeyFactory } from "@/lib/utils/query-config"
import { STATUS_CHECKS } from "@/lib/utils/validations"
import { useSession } from "@/features/auth"
import { toast } from "sonner"
import { verifyGST } from "../actions/onboarding"
import { resubmitOrganizationForApproval } from "../actions/approval"
import type { OrganizationListItem } from "../types"

// ============================================
// Query Keys - Using factory + custom extensions
// ============================================
const baseKeys = createGlobalQueryKeyFactory("organizations")

export const organizationKeys = {
	all: baseKeys.all(),
	lists: () => [...organizationKeys.all, "list"] as const,
	detail: (id: string) => [...organizationKeys.all, "detail", id] as const,
	stats: (id: string) => [...organizationKeys.all, "stats", id] as const,
	activity: (id: string) => [...organizationKeys.all, "activity", id] as const,
	campaignStats: (id: string) => [...organizationKeys.all, "campaignStats", id] as const,
	bankAccounts: (id: string) => [...organizationKeys.all, "bankAccounts", id] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * Get user's organizations
 *
 * Waits for session to be loaded before fetching to prevent
 * race condition where orgs are fetched before auth cookie is available.
 */
export function useOrganizations() {
	const { data: session, isPending: isSessionPending } = useSession()

	return useQuery({
		queryKey: organizationKeys.lists(),
		queryFn: async () => {
			const result = await client.auth.listOrganizations()
			return { organizations: result.organizations || [] }
		},
		// Wait for session to load before fetching organizations
		enabled: !isSessionPending && !!session?.user,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get organization by ID
 */
export function useOrganizationById(id: string) {
	return useQuery({
		queryKey: organizationKeys.detail(id),
		queryFn: () => client.auth.getFullOrganization(id, {}),
		enabled: !!id,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

// ============================================
// URL-BASED ORGANIZATION DETAIL HOOK
// ============================================

/**
 * Get organization detail with full data
 *
 * Use this when you need the full organization object with members.
 * For just checking status/approval, use useCurrentOrganization from @/hooks/shared.
 *
 * @param organizationId - Organization ID from URL params (useParams)
 * @deprecated Prefer useCurrentOrganization from @/hooks/shared for most use cases.
 *             Only use this hook when you need full org details including members.
 */
export function useOrganizationWithDetails(organizationId: string) {
	const { data: orgsData, isPending: isLoadingOrgs } = useOrganizations()
	const { data: orgDetail, isPending: isLoadingDetail } = useOrganizationById(organizationId)

	// Find org in list for basic info (has approvalStatus)
	const organizations = orgsData?.organizations || []
	const organizationFromList = organizations.find((org) => org.id === organizationId)

	// Merge detail with list item (detail has members, list has approvalStatus)
	const organization = orgDetail
		? { ...orgDetail, approvalStatus: organizationFromList?.approvalStatus }
		: organizationFromList

	// Derived status flags - use list item for approvalStatus (it's the source)
	// SSOT: Using STATUS_CHECKS helpers from @/lib/utils/validations
	const approvalStatus = organizationFromList?.approvalStatus
	const isApproved = STATUS_CHECKS.isApproved(approvalStatus)
	const isApprovalPending = STATUS_CHECKS.isPending(approvalStatus)
	const isDraft = STATUS_CHECKS.isDraft(approvalStatus)
	const isRejected = STATUS_CHECKS.isRejected(approvalStatus)
	const isBanned = STATUS_CHECKS.isBanned(approvalStatus)

	return {
		// Data
		organization,
		organizationId,

		// Status flags
		isApproved,
		isApprovalPending,
		isDraft,
		isRejected,
		isBanned,
		approvalStatus,

		// Loading
		isLoading: isLoadingOrgs || isLoadingDetail,
		isPending: isLoadingOrgs || isLoadingDetail,
	}
}

// ============================================
// ORGANIZATIONS LIST HOOK (for navigation/onboarding)
// ============================================

/**
 * Organizations list hook - for navigation and onboarding checks
 *
 * URL-based multi-tenancy: This hook ONLY manages the organizations LIST.
 * For organization details, use useCurrentOrganization(orgId) where orgId comes from URL.
 *
 * SSOT: Uses useOrganizations() internally to avoid duplicate API calls
 */
export function useOrganization() {
	const queryClient = useQueryClient()
	const { error: sessionError } = useSession()

	// SSOT: Reuse useOrganizations hook instead of duplicate useQuery
	const {
		data: organizationsData,
		isLoading: isLoadingOrgs,
		isFetching: isFetchingOrgs,
		isError: isOrgsError,
		refetch: refetchOrgs,
	} = useOrganizations()

	// Use OrganizationListItem - listOrganizations returns limited fields
	const organizations = organizationsData?.organizations as OrganizationListItem[] | undefined

	// Verify GST Preview - for onboarding before org creation
	const verifyGSTMutation = useMutation({
		mutationFn: async ({ gstNumber }: { gstNumber: string }) => {
			const result = await verifyGST({ gstNumber })
			if (!result?.data) throw new Error("GST verification failed")
			return result.data
		},
		onSuccess: () => {
			toast.success("GST verified successfully")
		},
		onError: createMutationErrorHandler("verify GST"),
	})

	// Resubmit after rejection (for rejected orgs only)
	const resubmitMutation = useMutation({
		mutationFn: async (orgId: string) => {
			const result = await resubmitOrganizationForApproval({ organizationId: orgId })
			if (!result?.data?.success) throw new Error("Resubmit failed")
			return result.data
		},
		onSuccess: (_, orgId) => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.detail(orgId) })
			queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
			toast.success("Reset to draft - you can now edit and resubmit")
		},
		onError: createMutationErrorHandler("resubmit organization"),
	})

	// Derived state from organizations list
	// SSOT: Using STATUS_CHECKS helpers from @/lib/utils/validations
	const isPending = isLoadingOrgs
	const orgsArray = Array.isArray(organizations) ? organizations : []
	const hasApprovedOrg = orgsArray.some((org) => STATUS_CHECKS.isApproved(org.approvalStatus))
	const hasPendingOrg = orgsArray.some((org) => STATUS_CHECKS.isPending(org.approvalStatus))
	const hasDraftOrg = orgsArray.some((org) => STATUS_CHECKS.isDraft(org.approvalStatus))
	const draftOrg = orgsArray.find(
		(org) => STATUS_CHECKS.isDraft(org.approvalStatus) || STATUS_CHECKS.isPending(org.approvalStatus)
	)
	const pendingOrg = orgsArray.find((org) => STATUS_CHECKS.isPending(org.approvalStatus))
	const approvedOrg = orgsArray.find((org) => STATUS_CHECKS.isApproved(org.approvalStatus))
	const needsOnboarding = !hasApprovedOrg

	return {
		// Data - organizations list only (no single org detail)
		organizations,

		// Derived (from organizations list)
		hasApprovedOrg,
		hasPendingOrg,
		hasDraftOrg,
		draftOrg,
		pendingOrg,
		approvedOrg,
		needsOnboarding,

		// Loading States
		isPending,
		isFetching: isFetchingOrgs,
		isLoading: isPending,
		isPendingOrgs: isLoadingOrgs,
		isOrgsError,
		isSessionError: !!sessionError,
		isVerifyingGST: verifyGSTMutation.isPending,
		isResubmitting: resubmitMutation.isPending,

		// Actions
		verifyGST: verifyGSTMutation.mutateAsync,
		resubmit: resubmitMutation.mutateAsync,
		refetch: refetchOrgs,
	}
}

/**
 * Update organization hook - requires orgId from URL
 * Can update: name, slug, logo
 */
export function useUpdateOrganization(orgId: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: { name?: string; slug?: string; logo?: string }) =>
			client.auth.updateOrganizationAuth(orgId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.detail(orgId) })
			queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
			toast.success("Organization updated")
		},
		onError: createMutationErrorHandler("update organization"),
	})
}

// ============================================
// Additional Organization Queries
// ============================================

/**
 * Get organization campaign stats
 */
export function useOrganizationCampaignStats(orgId: string, params?: { skip?: number; take?: number }) {
	return useQuery({
		queryKey: organizationKeys.campaignStats(orgId),
		queryFn: () =>
			client.organizations.getOrganizationCampaignStats(orgId, {
				skip: params?.skip ?? 0,
				take: params?.take ?? PAGE_SIZE.SMALL, // SSOT: Use centralized constant
			}),
		enabled: !!orgId,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get organization stats (aggregated metrics)
 */
export function useOrganizationStats(orgId: string) {
	return useQuery({
		queryKey: organizationKeys.stats(orgId),
		queryFn: () => client.organizations.getOrganizationStats(orgId),
		enabled: !!orgId,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

// NOTE: Bank account hooks (useBankAccounts, useVerifyBankAccount, useSetDefaultBankAccount)
// are in features/settings/hooks/use-settings.ts - import from @/features/settings

/**
 * Get single bank account
 * FIX: Use primitive value for showFull in query key
 */
export function useBankAccount(organizationId: string, bankAccountId: string, showFull?: boolean) {
	return useQuery({
		queryKey: [...organizationKeys.bankAccounts(organizationId), bankAccountId, showFull ?? false] as const,
		queryFn: () => client.organizations.getBankAccount(organizationId, bankAccountId, { showFull }),
		enabled: !!organizationId && !!bankAccountId,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * List pending invitations for organization
 */
export function useOrganizationInvitations(organizationId: string) {
	return useQuery({
		queryKey: ["organization-invitations", organizationId] as const,
		queryFn: () => client.auth.listInvitations(organizationId),
		enabled: !!organizationId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Request credit limit increase
 */
export function useRequestCreditIncrease(organizationId: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: { requestedAmount: number; reason?: string }) =>
			client.organizations.requestCreditIncrease(organizationId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.detail(organizationId) })
			toast.success("Credit increase request submitted")
		},
		onError: createMutationErrorHandler("request credit increase"),
	})
}

/**
 * Update bank account details
 */
export function useUpdateBankAccount(organizationId: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ bankAccountId, data }: { bankAccountId: string; data: { accountHolderName?: string; bankName?: string; accountType?: "current" | "savings" } }) =>
			client.organizations.updateBankAccount(organizationId, bankAccountId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.bankAccounts(organizationId) })
			toast.success("Bank account updated")
		},
		onError: createMutationErrorHandler("update bank account"),
	})
}

// ============================================
// DASHBOARD & OVERVIEW
// ============================================

/**
 * Get dashboard overview for organization
 * Includes stats, recent activity, and key metrics
 */
export function useDashboardOverview(organizationId: string) {
	return useQuery({
		queryKey: ["dashboard-overview", organizationId] as const,
		queryFn: () => client.organizations.getDashboardOverview(organizationId, {}),
		enabled: !!organizationId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Update organization logo
 */
export function useUpdateOrganizationLogo(organizationId: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: { logoUrl: string }) =>
			client.organizations.updateOrganizationLogo(organizationId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.detail(organizationId) })
			toast.success("Logo updated successfully")
		},
		onError: createMutationErrorHandler("update logo"),
	})
}

