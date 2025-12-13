import { getWalletData } from '@/lib/ssr-data'
import { WalletClient } from './wallet-client'

export const revalidate = 30

export default async function WalletPage() {
  // Direct server fetch - pure RSC
  const data = await getWalletData()

  return <WalletClient initialData={data} />
}
