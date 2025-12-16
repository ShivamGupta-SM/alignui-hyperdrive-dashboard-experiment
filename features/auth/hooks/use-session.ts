"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getCurrentUser, getSession } from "../actions/auth-actions"
import type { auth } from "@/lib/api/encore-client"
import { authQueryKeys } from "../lib/query-keys"

/**
 * Modern session hook - React Query as single source of truth
 *
 * @returns { data: { session, user } | null, isPending, error, refetch }
 */
export function useSession() {
	const queryClient = useQueryClient()

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: authQueryKeys.session(),
		queryFn: async () => {
			const userResult = await getCurrentUser()
			if (!userResult.success || !userResult.user) {
				return null
			}

			const sessionResult = await getSession()

			// If session exists, return it with user
			if (sessionResult.success && sessionResult.session) {
				return {
					session: {
						...sessionResult.session,
						user: sessionResult.user || userResult.user,
					},
					user: sessionResult.user || userResult.user,
				}
			}

			// No session, return user only
			return {
				session: null,
				user: userResult.user,
			}
		},
		staleTime: 5 * 60 * 1000,
		retry: false,
		refetchOnWindowFocus: true,
		refetchOnMount: true,
	})

	return {
		data: data || null,
		isPending: isLoading,
		error,
		refetch: async () => {
			queryClient.invalidateQueries({ queryKey: authQueryKeys.session() })
			return refetch()
		},
	}
}

/**
 * Selector hooks for derived state
 */
export function useUser() {
	const { data } = useSession()
	return data?.user ?? null
}

export function useSessionData() {
	const { data } = useSession()
	return data?.session ?? null
}

export function useIsAuthenticated() {
	const { data } = useSession()
	return !!data?.user
}
