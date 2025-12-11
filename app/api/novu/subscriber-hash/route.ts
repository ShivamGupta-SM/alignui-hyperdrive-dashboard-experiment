import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth-helpers'
import { generateSubscriberHash } from '@/lib/novu'

/**
 * GET /api/novu/subscriber-hash
 * Returns the HMAC hash for the authenticated user's subscriber ID
 * This is used for secure Novu Inbox authentication
 */
export async function GET() {
  const auth = await getAuthContext()

  if (!auth.success) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { userId, user, organizationId, organization } = auth.context

  // Generate HMAC hash for subscriber authentication
  const subscriberHash = generateSubscriberHash(userId)

  return NextResponse.json({
    success: true,
    data: {
      subscriberId: userId,
      subscriberHash,
      subscriber: {
        id: userId,
        email: user.email,
        name: user.name,
        organizationId,
        organizationName: organization.name,
      },
    },
  })
}
