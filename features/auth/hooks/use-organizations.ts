"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { switchOrganization as switchOrganizationAction } from "@/features/organizations/actions/organizations"
import { useSession } from "./use-session"
import { listOrganizations } from "../lib/api"
import { authQueryKeys } from "../lib/query-keys"
import { toast } from "sonner"

/**
 * Hook to fetch user's organizations
 */
export function useOrganizations() {
	return useQuery({
		queryKey: authQueryKeys.organizations(),
		queryFn: async () => {
			try {
				const result = await listOrganizations()
				const organizations = result.organizations || []
				
				// Debug logging
				if (process.env.NODE_ENV === "development") {
					console.log("[useOrganizations] Fetched organizations:", {
						count: organizations.length,
						orgs: organizations.map(org => ({ id: org.id, name: org.name, approvalStatus: org.approvalStatus }))
					})
				}
				
				return {
					organizations,
				}
			} catch (error) {
				// Log error for debugging
				console.error("[useOrganizations] Error fetching organizations:", error)
				throw error
			}
		},
		staleTime: 5 * 60 * 1000,
		retry: false,
		refetchOnWindowFocus: true,
	})
}

/**
 * Hook to switch active organization
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
		onMutate: async (organizationId) => {
			await queryClient.cancelQueries({ queryKey: authQueryKeys.session() })
			const previousSession = queryClient.getQueryData(authQueryKeys.session())
			queryClient.setQueryData(authQueryKeys.session(), (old: any) => {
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
		onError: (err, organizationId, context) => {
			if (context?.previousSession) {
				queryClient.setQueryData(authQueryKeys.session(), context.previousSession)
			}
			toast.error("Failed to switch organization", {
				description: err instanceof Error ? err.message : "An unexpected error occurred",
			})
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: authQueryKeys.session() })
			await queryClient.refetchQueries({ queryKey: authQueryKeys.session() })
			queryClient.invalidateQueries()
			router.refresh()
			toast.success("Organization switched successfully")
		},
	})
}

