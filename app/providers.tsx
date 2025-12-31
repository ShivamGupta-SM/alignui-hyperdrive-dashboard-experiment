"use client"

import { ThemeProvider } from "next-themes"
import { useState, type ReactNode } from "react"
import { Toaster } from "sonner"
import { Provider as TooltipProvider } from "@/components/ui/layout/tooltip"
import { NotificationProvider } from "@/components/ui/feedback/notification-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { PostHogProvider } from "@/lib/integrations/posthog"
import { NuqsAdapter } from "nuqs/adapters/next/app"

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
			<PostHogProvider>
				<NuqsAdapter>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<TooltipProvider>
							{children}
						</TooltipProvider>

						<NotificationProvider />
						<Toaster />
					</ThemeProvider>
				</NuqsAdapter>
			</PostHogProvider>
		</QueryClientProvider>
	)
}
