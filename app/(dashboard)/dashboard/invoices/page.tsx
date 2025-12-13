import { getInvoicesData } from '@/lib/ssr-data'
import { InvoicesClient } from './invoices-client'

export const revalidate = 60

export default async function InvoicesPage() {
  // Direct server fetch - pure RSC
  const data = await getInvoicesData()

  return <InvoicesClient initialData={data} />
}
