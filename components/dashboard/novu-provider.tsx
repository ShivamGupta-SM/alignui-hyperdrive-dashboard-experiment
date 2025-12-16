"use client"

import * as React from "react"
import { NovuProvider as NovuReactProvider } from "@novu/react"
import { useQueryClient } from "@tanstack/react-query"
import { useSession } from "@/features/auth"
// NovuReadyProvider removed - Novu not configured

interface NovuProviderProps {
	children: React.ReactNode
}

/**
 * Safe wrapper that checks if QueryClient is available before using useSession
 */
function NovuProviderInner({ children }: NovuProviderProps) {
	const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID
	const apiUrl = process.env.NEXT_PUBLIC_NOVU_API_URL
	const socketUrl = process.env.NEXT_PUBLIC_NOVU_WS_URL

	// These hooks require QueryClientProvider
	const queryClient = useQueryClient() // Will throw if not available
	const { data: session, isPending } = useSession()

	// If Novu is not configured, just render children
	if (!appId) {
		return <>{children}</>
	}

	// While loading session, render children without provider
	if (isPending) {
		return <>{children}</>
	}

	// If not authenticated, render children without provider
	const userId = session?.user && ("id" in session.user ? session.user.id : session.user.userID)
	if (!userId) {
		return <>{children}</>
	}

	// Use user ID as subscriber ID - backend syncs this with Novu
	const subscriberId = String(userId)

	return (
		<NovuReactProvider
			applicationIdentifier={appId}
			subscriberId={subscriberId}
			backendUrl={apiUrl}
			socketUrl={socketUrl}
		>
			{children}
		</NovuReactProvider>
	)
}
/**
 * Novu Provider Component with error boundary
 *
 * Wraps the app with NovuProvider for headless notification hooks.
 * Uses Encore client session for subscriber identification.
 *
 * If QueryClientProvider is not available, renders children without Novu.
 */
export function NovuProvider({ children }: NovuProviderProps) {
	// Check if we're in a context where QueryClientProvider might not be available
	// (e.g., error boundaries, SSR edge cases)
	try {
		return <NovuProviderInner>{children}</NovuProviderInner>
	} catch (error) {
		// If QueryClient is not available, just render children
		// This can happen in error boundaries or edge cases
		// Use dynamic import to avoid blocking render
		import("@/lib/logging/error-logger-simple").then(({ logWarn }) => {
			logWarn("NovuProvider: QueryClient not available, skipping Novu setup", { source: "NovuProvider", data: { error } })
		}).catch(() => {
			// Silently fail if logger is not available
		})
		return <>{children}</>
	}
}

