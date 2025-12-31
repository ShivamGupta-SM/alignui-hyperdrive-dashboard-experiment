/**
 * Auth React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 */

"use client"

import { useCallback, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { STALE_TIME, GC_TIME } from "@/lib/utils/query-config"
import { client } from "@/lib/api/client"
import { resetEncoreBrowserClient } from "@/lib/api/encore-browser"
import { getSession, signOut as signOutAction } from "../actions/auth-actions"
import { logError } from "@/lib/logging/error-logger-simple"

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
			// Single call - getSession() returns both session and user
			const sessionResult = await getSession({})

			if (!sessionResult?.data?.session || !sessionResult?.data?.user) {
				return null
			}

			return {
				session: sessionResult.data.session,
				user: sessionResult.data.user,
			}
		},
		// FIX: Increased stale time to MEDIUM (5min) since we have refetchOnWindowFocus
		// This reduces unnecessary API calls while keeping auth state fresh on tab focus
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG, // Keep session data in cache for 30 minutes
		retry: 1, // FIX: Allow 1 retry for transient network errors
		retryDelay: 1000,
		refetchOnWindowFocus: true, // Refetch when user returns to tab
		// FIX: Changed from "always" to true - only refetch if data is stale
		// "always" was causing unnecessary API calls even when data was fresh
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
 * Get active member role for organization
 */
export function useActiveMemberRole(organizationId: string) {
	return useQuery({
		queryKey: [...authKeys.all, "activeMemberRole", organizationId] as const,
		queryFn: async () => {
			const result = await client.auth.getActiveMemberRole(organizationId)
			return result.role
		},
		enabled: !!organizationId,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG, // Role rarely changes within session
		retry: false,
	})
}

/**
 * Check if current user has specific permission
 * Better Auth aligned - uses hasPermission API
 *
 * @example
 * const { data: canInvite } = useHasPermission({ member: ["create"] })
 * const { data: canDeleteOrg } = useHasPermission({ organization: ["delete"] })
 */
export function useHasPermission(permissions: { [key: string]: string[] }) {
	// FIX: Stable query key - serialize permissions to avoid object reference issues
	const permissionKey = JSON.stringify(permissions, Object.keys(permissions).sort())

	return useQuery({
		queryKey: [...authKeys.all, "permission", permissionKey] as const,
		queryFn: async () => {
			const result = await client.auth.hasPermission({ permissions })
			return result.hasPermission
		},
		staleTime: STALE_TIME.LONG,
		gcTime: GC_TIME.LONG, // Permissions rarely change
		retry: false,
	})
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Sign out hook
 * Simplified: removed redundant useRef, useState handles this correctly
 */
export function useSignOut(redirectTo = "/sign-in") {
	const router = useRouter()
	const queryClient = useQueryClient()
	const [isSigningOut, setIsSigningOut] = useState(false)

	const signOut = useCallback(async () => {
		// React 18+ handles state correctly in async callbacks
		if (isSigningOut) return

		setIsSigningOut(true)
		try {
			await signOutAction({})
			queryClient.clear()
			// Reset browser client singleton to clear any cached auth state
			resetEncoreBrowserClient()

			// Use centralized storage clearing
			try {
				const { clearSessionStorage } = await import("@/lib/constants/storage-keys")
				clearSessionStorage()
			} catch {
				// Ignore localStorage errors
			}
		} catch (error) {
			logError(error, { source: "useSignOut", data: { action: "signOut" } })
			queryClient.clear()
			try {
				const { clearSessionStorage } = await import("@/lib/constants/storage-keys")
				clearSessionStorage()
			} catch {
				// Ignore localStorage errors
			}
		} finally {
			router.push(redirectTo)
			router.refresh()
			setIsSigningOut(false)
		}
	}, [redirectTo, router, queryClient, isSigningOut])

	return { signOut, isSigningOut }
}

// Types are exported from @/features/auth (feature index)
