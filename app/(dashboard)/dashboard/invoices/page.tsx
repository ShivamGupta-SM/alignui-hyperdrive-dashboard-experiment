import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/get-query-client'
import { getInvoicesData } from '@/lib/data/invoices'
import { invoiceKeys } from '@/lib/query-keys'
import { InvoicesClient } from './invoices-client'

// Revalidate every 60 seconds (ISR) for better caching while staying fresh
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
