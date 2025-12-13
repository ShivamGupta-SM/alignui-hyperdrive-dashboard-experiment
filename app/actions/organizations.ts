'use server'

import { getEncoreClient } from '@/lib/encore'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

/**
 * Switch active organization
 * Updates the active organization in the backend and syncs with frontend
 */
export async function switchOrganization(organizationId: string) {
  const client = getEncoreClient()

  try {
    // Set active organization via Encore client
    await client.auth.setActiveOrganization({ organizationId })

    // Update cookie for server-side access
    const cookieStore = await cookies()
    cookieStore.set('active-organization-id', organizationId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    })

    // Revalidate all paths to refresh data with new organization context
    revalidatePath('/', 'layout')
    // Also revalidate session to update activeOrganizationId in user object
    revalidatePath('/dashboard', 'layout')

    return {
      success: true,
      organizationId,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to switch organization',
    }
  }
}
