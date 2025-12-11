import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/get-query-client'
import { getProfileData } from '@/lib/data/user'
import { profileKeys } from '@/lib/query-keys'
import { ProfileClient } from './profile-client'

// Revalidate every 60 seconds
export const revalidate = 60

export default async function ProfilePage() {
  const queryClient = getServerQueryClient()

  // Prefetch profile data on server
  await queryClient.prefetchQuery({
    queryKey: profileKeys.data(),
    queryFn: () => getProfileData(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileClient />
    </HydrationBoundary>
  )
}
