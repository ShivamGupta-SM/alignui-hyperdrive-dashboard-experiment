"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { ReactNode } from "react"
import { getQueryClient } from "./get-query-client"

export function QueryProvider({ children }: { children: ReactNode }) {
    // Get the singleton QueryClient (created once on client, fresh per request on server)
    const queryClient = getQueryClient()

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}

export { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
