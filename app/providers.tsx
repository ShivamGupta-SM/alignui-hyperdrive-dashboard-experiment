"use client"

import { AuthUIProvider } from "@/lib/auth"
import NextLink from "next/link"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { Toaster } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Provider as TooltipProvider } from "@/components/ui/tooltip"
import { NotificationProvider } from "@/components/ui/notification-provider"
import { QueryProvider } from "@/lib/query-client"
import { PostHogProvider } from "@/lib/posthog"
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { MSWInit } from "@/components/msw-init"

// Wrapper component to avoid serialization issues with Next.js Link during static generation
function AuthLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
    return (
        <NextLink href={href} className={className}>
            {children}
        </NextLink>
    )
}

export function Providers({ children }: { children: ReactNode }) {
    const router = useRouter()

    return (
        <PostHogProvider>
            <NuqsAdapter>
                <QueryProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <AuthUIProvider
                            authClient={authClient}
                            navigate={router.push}
                            replace={router.replace}
                            onSessionChange={() => {
                                router.refresh()
                            }}
                            Link={AuthLink}
                        >
                            <TooltipProvider>
                                <MSWInit>
                                    {children}
                                </MSWInit>
                            </TooltipProvider>

                            <NotificationProvider />
                            <Toaster />
                        </AuthUIProvider>
                    </ThemeProvider>
                </QueryProvider>
            </NuqsAdapter>
        </PostHogProvider>
    )
}
