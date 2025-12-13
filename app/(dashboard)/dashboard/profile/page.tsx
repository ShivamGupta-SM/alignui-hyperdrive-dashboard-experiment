import { getProfileData } from '@/lib/ssr-data'
import { ProfileClient } from './profile-client'

export default async function ProfilePage() {
  // Direct server fetch - pure RSC
  const data = await getProfileData()

  return <ProfileClient initialData={data} />
}
