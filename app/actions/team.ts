'use server'

import { revalidatePath } from 'next/cache'
import { getEncoreClient } from '@/lib/encore'
import { cookies } from 'next/headers'

async function getOrganizationId(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.get('active-organization-id')?.value || ''
}

export async function inviteMember(email: string, role: string) {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  
  try {
    // client.organizations.inviteMember(orgId, { email, role })
    await client.organizations.inviteMember(orgId, { email, role })
    revalidatePath('/dashboard/team')
    return { success: true, message: 'Invitation sent' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to invite member' }
  }
}

export async function removeMember(memberId: string) {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  
  try {
    // client.organizations.removeMember(orgId, memberId)
    await client.organizations.removeMember(orgId, memberId)
    revalidatePath('/dashboard/team')
    return { success: true, message: 'Member removed' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove member' }
  }
}
