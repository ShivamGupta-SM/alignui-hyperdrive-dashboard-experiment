"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { switchOrganization as switchOrganizationAction } from "../actions/organizations"
import { useSession } from "@/features/auth/hooks/use-session"
import { listOrganizations } from "../lib/api"
import { organizationsQueryKeys } from "../lib/query-keys"
import { authQueryKeys } from "@/features/auth/lib/query-keys"
import { toast } from "sonner"
import type { organizations, shared } from "@/lib/api/encore-browser"

// Re-export types from Encore for convenience
export type Organization = organizations.Organization
export type OrganizationCampaignStats = organizations.OrganizationCampaignStats
export type OrganizationStats = organizations.OrganizationStats
export type ApprovalStatus = shared.ApprovalStatus
export type AccountTier = shared.AccountTier

/**
 * Hook to fetch user's organizations
 * Uses React Query for caching and automatic refetching
 *
 * @returns Organizations list with loading/error states
 *
 * @example
 * const { data: organizations, isLoading } = useOrganizations()
 */
export function useOrganizations() {
	return useQuery({
		queryKey: organizationsQueryKeys.list(),
		queryFn: async () => {
			const result = await listOrganizations()
			return result
		},
		staleTime: 5 * 60 * 1000,
		retry: false,
		refetchOnWindowFocus: true,
	})
}

/**
 * Modern hook to switch active organization
 * Uses React Query optimistic updates for instant UI feedback
 *
 * Features:
 * - Optimistic updates (instant UI)
 * - Automatic rollback on error
 * - Session refetch on success
 * - All queries invalidated
 *
 * @example
 * const switchOrg = useSwitchOrganization()
 * switchOrg.mutate(orgId)
 */
export function useSwitchOrganization() {
	const queryClient = useQueryClient()
	const router = useRouter()
	const { data: sessionData } = useSession()

	return useMutation({
		mutationFn: async (organizationId: string) => {
			const result = await switchOrganizationAction(organizationId)
			if (!result.success) {
				throw new Error(result.error?.message || "Failed to switch organization")
			}
			return result
		},
		// Optimistic update - instant UI feedback
		onMutate: async (organizationId) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["session"] })

			// Snapshot previous value
			const previousSession = queryClient.getQueryData<{
				session: { user: { activeOrganizationId?: string } }
				user: { activeOrganizationId?: string }
			} | null>(["session"])

			// Optimistically update session
			queryClient.setQueryData<{
				session: { user: { activeOrganizationId?: string } }
				user: { activeOrganizationId?: string }
			} | null>(["session"], (old) => {
				if (!old) return old
				return {
					...old,
					user: {
						...old.user,
						activeOrganizationId: organizationId,
					},
				}
			})

			return { previousSession }
		},
		// On error, rollback and show error
		onError: (err, organizationId, context) => {
			if (context?.previousSession) {
				queryClient.setQueryData(authQueryKeys.session(), context.previousSession)
			}
			// Show error toast
			toast.error("Failed to switch organization", {
				description: err instanceof Error ? err.message : "An unexpected error occurred",
			})
		},
		// On success, refetch and invalidate
		onSuccess: async () => {
			// CRITICAL: Invalidate and WAIT for session refetch to complete
			// This ensures the session has the new activeOrganizationId before router.refresh()
			await queryClient.invalidateQueries({ queryKey: authQueryKeys.session() })
			await queryClient.refetchQueries({ queryKey: authQueryKeys.session() })
			
			// Invalidate all other queries to refetch with new organization context
			queryClient.invalidateQueries()

			// Refresh router to update server components
			// This happens AFTER session is refetched, so server components get new org
			router.refresh()
			
			// Show success toast
			toast.success("Organization switched successfully")
		},
	})
}
