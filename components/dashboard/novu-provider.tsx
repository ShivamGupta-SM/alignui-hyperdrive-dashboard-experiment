"use client"

import * as React from "react"
import { NovuProvider as NovuReactProvider } from "@novu/react"
import { useSession } from "@/hooks/use-session"
import { NovuReadyProvider } from "@/components/dashboard/notification-center"

interface NovuProviderProps {
	children: React.ReactNode
}

/**
 * Novu Provider Component
 *
 * Wraps the app with NovuProvider for headless notification hooks.
 * Uses Encore client session for subscriber identification.
 *
 * Backend handles subscriber sync via Novu API when user authenticates.
 * 
 * Note: This component must be rendered inside QueryClientProvider.
 * It's wrapped in DashboardShellInner which uses useQueryClient, ensuring
 * QueryClientProvider is available before this component renders.
 */
export function NovuProvider({ children }: NovuProviderProps) {
	const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID
	const apiUrl = process.env.NEXT_PUBLIC_NOVU_API_URL
	const socketUrl = process.env.NEXT_PUBLIC_NOVU_WS_URL

	// useSession requires QueryClientProvider to be in the component tree
	// DashboardShellInner uses useQueryClient before rendering this component,
	// so QueryClientProvider should be available
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
