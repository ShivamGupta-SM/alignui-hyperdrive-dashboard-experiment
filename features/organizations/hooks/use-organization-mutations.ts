/**
 * Organizations Mutation Hooks
 */

"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSession } from "@/features/auth/hooks/use-session"
import { organizationsQueryKeys } from '../lib/query-keys'
import { authQueryKeys } from '@/features/auth/lib/query-keys'
import * as organizationActions from '../actions/organizations'

/**
 * Hook: Switch active organization
 * 
 * @description
 * Switches the active organization with optimistic updates.
 * 
 * @returns Mutation object with mutate function
 */
export function useSwitchOrganization() {
	const queryClient = useQueryClient()
	const router = useRouter()
	const { data: sessionData } = useSession()

	return useMutation({
		mutationFn: (organizationId: string) =>
			organizationActions.switchOrganization(organizationId),
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
		onError: (err, _, context) => {
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

