import { getProductsData } from '@/lib/ssr-data'
import { ProductsClient } from './products-client'

export const revalidate = 60

export default async function ProductsPage() {
  // Direct server fetch - pure RSC
  const data = await getProductsData()

  return <ProductsClient initialData={data} />
}
