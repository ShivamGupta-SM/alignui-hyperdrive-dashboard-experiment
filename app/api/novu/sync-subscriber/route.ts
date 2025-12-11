import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth-helpers'
import { syncSubscriber } from '@/lib/novu'

/**
 * POST /api/novu/sync-subscriber
 * Syncs the current user as a Novu subscriber
 * Should be called after successful authentication
 */
export async function POST() {
  const auth = await getAuthContext()

  if (!auth.success) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { userId, user, organizationId, organization } = auth.context

  try {
    // Parse name into first and last
    const nameParts = user.name?.split(' ') || []
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const success = await syncSubscriber(userId, {
      email: user.email,
      firstName,
      lastName,
      organizationId,
      organizationName: organization.name,
      role: user.role,
    })

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to sync subscriber' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        subscriberId: userId,
        synced: true,
      },
    })
  } catch (error) {
    console.error('[Novu Sync] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
