/**
 * Unified Error Handler - Works for both client and server
 * 
 * This file exports functions that work in both client and server contexts.
 * Uses conditional logic to handle differences between environments.
 */

import { isAuthenticationError } from "./encore-error-handler"

/**
 * Client-side: Handle authentication errors by redirecting to login
 * Use this in error boundaries and catch blocks on the client
 * 
 * Industry Standard: Uses Next.js router when available, falls back to window.location
 */
export function handleAuthError(error: unknown): void {
	if (isAuthenticationError(error)) {
		// Only run on client
		if (typeof window !== "undefined") {
			// Clear auth token cookie
			document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

			// Industry Standard: Try to use Next.js router if available
			// Fall back to window.location only if router is not available (e.g., in error boundaries)
			try {
				// Dynamic import to avoid bundling router in error handler
				// This allows router to be used when available, but doesn't break if not
				// Note: __next_router is an internal Next.js property, so we use type guard
				interface WindowWithNextRouter extends Window {
					__next_router?: {
						push: (url: string) => void
					}
				}
				
				// Type guard for checking if window has Next.js router
				function hasNextRouter(window: Window): window is WindowWithNextRouter {
					return "__next_router" in window
				}
				
				const windowWithRouter = window as WindowWithNextRouter
				if (hasNextRouter(windowWithRouter) && windowWithRouter.__next_router) {
					const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
					windowWithRouter.__next_router.push(`/sign-in?redirect=${returnUrl}`)
					return
				}
			} catch {
				// Router not available, fall back to window.location
			}

			// Fallback: Use window.location only when router is not available
			// This is acceptable in error handlers where router might not be accessible
			// Note: In Next.js 16, prefer using router.push() when possible
			// However, in error boundaries and edge cases, window.location is acceptable
			const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
			window.location.href = `/sign-in?redirect=${returnUrl}`
		}
	}
}

/**
 * Server-side: Handle authentication errors by redirecting to login
 * Use this in Server Components and Server Actions
 * 
 * Note: This must be imported with "use server" directive in the calling file
 * or used in a Server Action/Component directly
 */
export async function handleServerAuthError(error: unknown): Promise<void> {
	if (isAuthenticationError(error)) {
		// Dynamic import to avoid bundling redirect in client
		const { redirect } = await import("next/navigation")
		redirect("/sign-in")
	}
	// Not an auth error, let caller handle it normally
}
