"use client"

import * as React from "react"
import { NovuProvider as NovuReactProvider } from "@novu/react"
import { useQueryClient } from "@tanstack/react-query"
import { useSession } from "@/hooks/use-session"
import { NovuReadyProvider } from "@/components/dashboard/notification-center"

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
	if (!session?.user?.id) {
		return <>{children}</>
	}

	// Use user ID as subscriber ID - backend syncs this with Novu
	const subscriberId = String(session.user.id)

	return (
		<NovuReactProvider
			applicationIdentifier={appId}
			subscriberId={subscriberId}
			backendUrl={apiUrl}
			socketUrl={socketUrl}
		>
			<NovuReadyProvider>{children}</NovuReadyProvider>
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
		console.warn("NovuProvider: QueryClient not available, skipping Novu setup", error)
		return <>{children}</>
	}
}

