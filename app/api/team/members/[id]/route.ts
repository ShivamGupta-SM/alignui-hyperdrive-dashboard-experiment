import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody, errorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockTeamMembers } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateMemberSchema = z.object({
  role: z.enum(['admin', 'manager', 'viewer'] as const),
})

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    const member = mockTeamMembers.find(
      m => m.id === id && m.organizationId === orgId
    )

    if (!member) {
      return notFoundResponse('Team member')
    }

    return successResponse(member)
  } catch (error) {
    console.error('Team member GET error:', error)
    return serverErrorResponse('Failed to fetch team member')
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const parsed = await parseBody(request, updateMemberSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { role } = parsed.data

    const member = mockTeamMembers.find(
      m => m.id === id && m.organizationId === orgId
    )

    if (!member) {
      return notFoundResponse('Team member')
    }

    // Cannot change owner's role
    if (member.role === 'owner') {
      return errorResponse('Cannot change the owner\'s role', 400)
    }

    // Check current user's permission
    const currentUserRole = mockTeamMembers.find(
      m => m.id === auth.context.userId && m.organizationId === orgId
    )?.role

    if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
      return errorResponse('You do not have permission to change roles', 403)
    }

    // Admin cannot change other admin's role (only owner can)
    if (member.role === 'admin' && currentUserRole !== 'owner') {
      return errorResponse('Only the owner can change admin roles', 403)
    }

    await delay(DELAY.FAST)

    const updatedMember = {
      ...member,
      role,
      updatedAt: new Date(),
    }

    return successResponse(updatedMember)
  } catch (error) {
    console.error('Team member PATCH error:', error)
    return serverErrorResponse('Failed to update team member')
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const member = mockTeamMembers.find(
      m => m.id === id && m.organizationId === orgId
    )

    if (!member) {
      return notFoundResponse('Team member')
    }

    // Cannot remove owner
    if (member.role === 'owner') {
      return errorResponse('Cannot remove the organization owner', 400)
    }

    // Cannot remove yourself
    if (member.id === auth.context.userId) {
      return errorResponse('Cannot remove yourself. Use "Leave Organization" instead.', 400)
    }

    // Check current user's permission
    const currentUserRole = mockTeamMembers.find(
      m => m.id === auth.context.userId && m.organizationId === orgId
    )?.role

    if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
      return errorResponse('You do not have permission to remove members', 403)
    }

    // Admin cannot remove other admins (only owner can)
    if (member.role === 'admin' && currentUserRole !== 'owner') {
      return errorResponse('Only the owner can remove admins', 403)
    }

    await delay(DELAY.FAST)

    return successResponse({
      message: 'Team member removed successfully',
      id,
      name: member.name,
    })
  } catch (error) {
    console.error('Team member DELETE error:', error)
    return serverErrorResponse('Failed to remove team member')
  }
}
