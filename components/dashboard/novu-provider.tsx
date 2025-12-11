'use client'

import * as React from 'react'
import { NovuProvider as NovuReactProvider } from '@novu/react'
import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/axios'
import { NovuReadyProvider } from '@/components/dashboard/notification-center'
import type { ApiResponse } from '@/lib/types'

interface SubscriberAuth {
  subscriberId: string
  subscriberHash: string | null
  subscriber: {
    id: string
    email: string
    name: string
    organizationId: string
    organizationName: string
  }
}

interface NovuProviderProps {
  children: React.ReactNode
}

/**
 * Novu Provider Component
 *
 * Wraps the app with NovuProvider for headless notification hooks.
 * Only renders the provider when Novu is configured and authenticated.
 */
export function NovuProvider({ children }: NovuProviderProps) {
  const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID
  const apiUrl = process.env.NEXT_PUBLIC_NOVU_API_URL
  const socketUrl = process.env.NEXT_PUBLIC_NOVU_WS_URL

  const { data: authData, isLoading } = useQuery({
    queryKey: ['novu', 'subscriber-hash'],
    queryFn: () => get<ApiResponse<SubscriberAuth>>('/api/novu/subscriber-hash'),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: !!appId,
  })

  // If Novu is not configured, just render children
  if (!appId) {
    return <>{children}</>
  }

  // While loading auth, render children without provider
  if (isLoading) {
    return <>{children}</>
  }

  // If auth failed, render children without provider
  if (!authData?.success || !authData.data?.subscriberId) {
    return <>{children}</>
  }

  const { subscriberId, subscriberHash } = authData.data

  // Note: Novu React SDK uses internal caching via React Query by default
  // The SDK handles stale-while-revalidate pattern automatically
  // Real-time WebSocket updates keep data fresh without manual cache config
  return (
    <NovuReactProvider
      applicationIdentifier={appId}
      subscriberId={subscriberId}
      subscriberHash={subscriberHash || undefined}
      backendUrl={apiUrl}
      socketUrl={socketUrl}
    >
      <NovuReadyProvider>
        {children}
      </NovuReadyProvider>
    </NovuReactProvider>
  )
}
