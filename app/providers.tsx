"use client"

import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { Toaster } from "sonner"
import { Provider as TooltipProvider } from "@/components/ui/tooltip"
import { NotificationProvider } from "@/components/ui/notification-provider"

import { PostHogProvider } from "@/lib/posthog"
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { MSWInit } from "@/components/msw-init"

export function Providers({ children }: { children: ReactNode }) {
    return (
        <PostHogProvider>
            <NuqsAdapter>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <TooltipProvider>
                        <MSWInit>
                            {children}
                        </MSWInit>
                    </TooltipProvider>

                    <NotificationProvider />
                    <Toaster />
                </ThemeProvider>
            </NuqsAdapter>
        </PostHogProvider>
    )
}
