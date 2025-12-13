import { getSettingsData } from '@/lib/ssr-data'
import { SettingsClient } from './settings-client'

export const revalidate = 120

export default async function SettingsPage() {
  // Direct server fetch - pure RSC
  const data = await getSettingsData()

  return <SettingsClient initialData={data} />
}
