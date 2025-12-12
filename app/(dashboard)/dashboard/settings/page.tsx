import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/get-query-client'
import { getSettingsData } from '@/lib/ssr-data'
import { settingsKeys } from '@/hooks/use-settings'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const queryClient = getServerQueryClient()

  // Prefetch settings data on server
  await queryClient.prefetchQuery({
    queryKey: settingsKeys.data(),
    queryFn: () => getSettingsData(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettingsClient />
    </HydrationBoundary>
  )
}
