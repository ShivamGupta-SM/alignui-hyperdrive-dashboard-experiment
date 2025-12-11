import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockTeamMembers } from '@/lib/mocks'
import { DURATIONS } from '@/lib/types/constants'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Mock invitations (in production, this would be in database)
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

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const invitation = mockInvitations.find(
      i => i.id === id && i.organizationId === orgId
    )

    if (!invitation) {
      return notFoundResponse('Invitation')
    }

    if (invitation.status !== 'pending') {
      return errorResponse('Cannot cancel a non-pending invitation', 400)
    }

    // Check current user's permission
    const currentUserRole = mockTeamMembers.find(
      m => m.id === auth.context.userId && m.organizationId === orgId
    )?.role

    if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
      return errorResponse('You do not have permission to cancel invitations', 403)
    }

    await delay(DELAY.FAST)

    return successResponse({
      message: 'Invitation cancelled successfully',
      id,
      email: invitation.email,
    })
  } catch (error) {
    console.error('Invitation DELETE error:', error)
    return serverErrorResponse('Failed to cancel invitation')
  }
}

// Resend invitation
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const invitation = mockInvitations.find(
      i => i.id === id && i.organizationId === orgId
    )

    if (!invitation) {
      return notFoundResponse('Invitation')
    }

    if (invitation.status !== 'pending') {
      return errorResponse('Cannot resend a non-pending invitation', 400)
    }

    await delay(DELAY.FAST)

    // In production, resend email
    const updatedInvitation = {
      ...invitation,
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + DURATIONS.INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    }

    return successResponse({
      invitation: updatedInvitation,
      message: `Invitation resent to ${invitation.email}`,
    })
  } catch (error) {
    console.error('Invitation resend error:', error)
    return serverErrorResponse('Failed to resend invitation')
  }
}
