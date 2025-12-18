/**
 * Auth React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 */

"use client"

import { useCallback, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import { STALE_TIME } from "@/lib/utils/query-config"
import { getCurrentUser, getSession, signOut as signOutAction } from "../actions/auth-actions"
import { switchOrganization as switchOrganizationAction } from "@/features/organizations/actions/organizations"
import { toast } from "sonner"
import { logError } from "@/lib/logging/error-logger-simple"
import { getErrorMessage } from "@/lib/utils/format"

// ============================================
// Client Instance
// ============================================
const client = getEncoreBrowserClient()

// ============================================
// Query Keys
// ============================================
export const authKeys = {
	all: ["auth"] as const,
	session: () => [...authKeys.all, "session"] as const,
	user: () => [...authKeys.all, "user"] as const,
	organizations: () => [...authKeys.all, "organizations"] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * Get current session and user
 */
export function useSession() {
	const queryClient = useQueryClient()

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: authKeys.session(),
		queryFn: async () => {
			const [userResult, sessionResult] = await Promise.all([getCurrentUser({}), getSession({})])

			// getCurrentUser returns { user } while getSession returns { session?, user? }
			if (!userResult?.data?.user) {
				return null
			}

			// Check if we have a valid session from getSession
			if (sessionResult?.data?.session) {
				return {
					session: {
						...sessionResult.data.session,
						user: sessionResult.data.user || userResult.data.user,
					},
					user: sessionResult.data.user || userResult.data.user,
				}
			}

			return {
				session: null,
				user: userResult.data.user,
			}
		},
		staleTime: STALE_TIME.MEDIUM,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
	})

	return {
		data: data || null,
		isPending: isLoading,
		error,
		refetch: async () => {
			queryClient.invalidateQueries({ queryKey: authKeys.session() })
			return refetch()
		},
	}
}

/**
 * Get current user
 */
export function useUser() {
	const { data } = useSession()
	return data?.user ?? null
}

/**
 * Get session data
 */
export function useSessionData() {
	const { data } = useSession()
	return data?.session ?? null
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated() {
	const { data } = useSession()
	return !!data?.user
}

/**
 * Get user's organizations
 */
export function useOrganizations() {
	return useQuery({
		queryKey: authKeys.organizations(),
		queryFn: async () => {
			const result = await client.auth.listOrganizations()
			return { organizations: result.organizations || [] }
		},
		staleTime: STALE_TIME.MEDIUM,
		retry: false,
		refetchOnWindowFocus: false,
	})
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
		mutationFn: async (organizationId: string) => {
			await switchOrganizationAction({ organizationId })
		},
		onMutate: async (organizationId) => {
			await queryClient.cancelQueries({ queryKey: authKeys.session() })
			const previousSession = queryClient.getQueryData(authKeys.session())
			queryClient.setQueryData(authKeys.session(), (old: unknown) => {
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
		onError: (err, _organizationId, context) => {
			if (context?.previousSession) {
				queryClient.setQueryData(authKeys.session(), context.previousSession)
			}
			toast.error("Failed to switch organization", {
				description: getErrorMessage(err, "An unexpected error occurred"),
			})
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: authKeys.session() })
			await queryClient.invalidateQueries({ queryKey: authKeys.organizations() })
			await queryClient.invalidateQueries({ queryKey: ["organization"] })
			router.replace("/dashboard")
			router.refresh()
			toast.success("Organization switched successfully")
		},
	})
}

/**
 * Sign out hook
 */
export function useSignOut(redirectTo: string = "/sign-in") {
	const router = useRouter()
	const queryClient = useQueryClient()
	const [isSigningOut, setIsSigningOut] = useState(false)

	const signOut = useCallback(async () => {
		if (isSigningOut) return

		setIsSigningOut(true)
		try {
			await signOutAction({})
			queryClient.clear()

			try {
				localStorage.removeItem("onboarding-draft")
				localStorage.removeItem("onboarding-draft-timestamp")
				const keys = Object.keys(localStorage)
				keys.forEach((key) => {
					if (key.includes("onboarding-alert-dismissed")) {
						localStorage.removeItem(key)
					}
				})
			} catch {
				// Ignore localStorage errors
			}
		} catch (error) {
			logError(error, { source: "useSignOut", data: { action: "signOut" } })
			queryClient.clear()
			try {
				localStorage.removeItem("onboarding-draft")
				localStorage.removeItem("onboarding-draft-timestamp")
			} catch {
				// Ignore localStorage errors
			}
		} finally {
			router.push(redirectTo)
			router.refresh()
			setIsSigningOut(false)
		}
	}, [isSigningOut, redirectTo, router, queryClient])

	return { signOut, isSigningOut }
}

// Re-export types
export type * from "../types"
