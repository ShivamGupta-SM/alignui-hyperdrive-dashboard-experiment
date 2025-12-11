import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/get-query-client'
import { getWalletData } from '@/lib/data/wallet'
import { walletKeys } from '@/lib/query-keys'
import { WalletClient } from './wallet-client'

export default async function WalletPage() {
  const queryClient = getServerQueryClient()

  // Prefetch wallet data on server
  await queryClient.prefetchQuery({
    queryKey: walletKeys.data(),
    queryFn: () => getWalletData(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WalletClient />
    </HydrationBoundary>
  )
}
