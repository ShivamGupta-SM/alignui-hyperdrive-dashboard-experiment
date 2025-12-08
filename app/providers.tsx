"use client"

import { AuthUIProvider } from "@/lib/auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { Toaster } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Provider as TooltipProvider } from "@/components/ui/tooltip"
import { NotificationProvider } from "@/components/ui/notification-provider"
import { QueryProvider } from "@/lib/query-client"

export function Providers({ children }: { children: ReactNode }) {
    const router = useRouter()

    return (
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
                    Link={Link}
                >
                    <TooltipProvider>
                        {children}
                    </TooltipProvider>

                    <NotificationProvider />
                    <Toaster />
                </AuthUIProvider>
            </ThemeProvider>
        </QueryProvider>
    )
}
