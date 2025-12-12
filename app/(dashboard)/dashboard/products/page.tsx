import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/get-query-client'
import { getProductsData } from '@/lib/ssr-data'
import { productKeys } from '@/lib/query-keys'
import { ProductsClient } from './products-client'

// Revalidate every 60 seconds
export const revalidate = 60

export default async function ProductsPage() {
  const queryClient = getServerQueryClient()

  // Prefetch products on server
  await queryClient.prefetchQuery({
    queryKey: productKeys.list({}),
    queryFn: () => getProductsData(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsClient />
    </HydrationBoundary>
  )
}
