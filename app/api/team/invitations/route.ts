import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { DURATIONS } from '@/lib/types/constants'

// Mock invitations
const mockInvitations = [
  {
    id: 'inv-1',
    email: 'pending@example.com',
    role: 'manager',
    organizationId: '1',
    invitedBy: '1',
    status: 'pending',
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + DURATIONS.INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    // Filter invitations by organization
    const invitations = mockInvitations.filter(i => i.organizationId === orgId)

    return successResponse(invitations)
  } catch (error) {
    console.error('Invitations GET error:', error)
    return serverErrorResponse('Failed to fetch invitations')
  }
}
