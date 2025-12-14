"use client"

// Initialize navigation debugging in development
if (process.env.NODE_ENV === "development") {
	import("@/lib/debug-navigation").catch(() => {
		// Silently fail if debug file doesn't exist
	})
}

import { ThemeProvider } from "next-themes"
import { useState, type ReactNode } from "react"
import { Toaster } from "sonner"
import { Provider as TooltipProvider } from "@/components/ui/tooltip"
import { NotificationProvider } from "@/components/ui/notification-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { PostHogProvider } from "@/lib/posthog"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { MSWInit } from "@/components/msw-init"
import { NovuProvider } from "@/components/dashboard/novu-provider"

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000, // 1 minute
				refetchOnWindowFocus: false,
			},
		},
	})
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
	if (typeof window === "undefined") {
		// Server: always make a new query client
		return makeQueryClient()
	}
	// Browser: make a new query client if we don't already have one
	if (!browserQueryClient) browserQueryClient = makeQueryClient()
	return browserQueryClient
}

export function Providers({ children }: { children: ReactNode }) {
	const queryClient = getQueryClient()

	return (
		<QueryClientProvider client={queryClient}>
			<NovuProvider>
				<PostHogProvider>
					<NuqsAdapter>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							<TooltipProvider>
								<MSWInit>{children}</MSWInit>
							</TooltipProvider>

							<NotificationProvider />
							<Toaster />
						</ThemeProvider>
					</NuqsAdapter>
				</PostHogProvider>
			</NovuProvider>
		</QueryClientProvider>
	)
}
