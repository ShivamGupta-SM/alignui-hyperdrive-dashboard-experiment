import { getTeamData } from '@/lib/ssr-data'
import { TeamClient } from './team-client'

export const revalidate = 60

export default async function TeamPage() {
  // Direct server fetch - pure RSC
  const data = await getTeamData()

  return <TeamClient initialData={data} />
}
