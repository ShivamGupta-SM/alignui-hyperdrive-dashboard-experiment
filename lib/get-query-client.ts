import { QueryClient, isServer } from '@tanstack/react-query'
import { cache } from 'react'

// Server-side: Create a new QueryClient per request (using React cache for deduplication)
// Client-side: Reuse the same QueryClient instance
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR: Disable retries on server to fail fast
        retry: isServer ? false : 3,
        // Data is fresh for 60 seconds
        staleTime: 60 * 1000,
        // Disable refetch on window focus by default
        refetchOnWindowFocus: false,
        // Prevent refetch on mount if data is fresh (important for SSR hydration)
        refetchOnMount: false,
      },
      dehydrate: {
        // Only dehydrate successful queries
        shouldDehydrateQuery: (query) =>
          query.state.status === 'success',
      },
    },
  })
}

// Browser singleton
let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (isServer) {
    // Server: Always create a new QueryClient
    // Using React.cache() ensures we get the same client within a single request
    return makeQueryClient()
  }

  // Browser: Reuse the same QueryClient
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

// Server-only: Cached QueryClient for the current request
// This ensures prefetchQuery calls in RSCs share the same client
export const getServerQueryClient = cache(() => makeQueryClient())
