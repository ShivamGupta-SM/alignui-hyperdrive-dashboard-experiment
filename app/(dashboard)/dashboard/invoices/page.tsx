import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/get-query-client'
import { getInvoicesData } from '@/lib/ssr-data'
import { invoiceKeys } from '@/lib/query-keys'
import { InvoicesClient } from './invoices-client'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

export default async function InvoicesPage() {
  const queryClient = getServerQueryClient()

  // Prefetch invoices data on server
  await queryClient.prefetchQuery({
    queryKey: invoiceKeys.data(),
    queryFn: () => getInvoicesData(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InvoicesClient />
    </HydrationBoundary>
  )
}
