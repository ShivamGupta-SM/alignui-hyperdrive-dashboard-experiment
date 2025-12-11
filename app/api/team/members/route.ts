import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody, errorResponse, paginatedResponse, calculatePagination, paginateArray } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockTeamMembers } from '@/lib/mocks'
import { DURATIONS, LIMITS } from '@/lib/types/constants'
import type { UserRole } from '@/lib/types'

const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'viewer'] as const),
  message: z.string().max(500).optional(),
})

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(searchParams.get('limit') || String(LIMITS.TEAM_MEMBERS_PAGE_SIZE), 10)
    const role = searchParams.get('role') as UserRole | null
    const search = searchParams.get('search')

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    // Filter members by organization
    let members = mockTeamMembers.filter(m => m.organizationId === orgId)

    // Filter by role
    if (role) {
      members = members.filter(m => m.role === role)
    }

    // Search by name or email
    if (search) {
      const searchLower = search.toLowerCase()
      members = members.filter(m =>
        m.name.toLowerCase().includes(searchLower) ||
        m.email.toLowerCase().includes(searchLower)
      )
    }

    const total = members.length
    const paginatedMembers = paginateArray(members, page, limit)
    const meta = calculatePagination(total, page, limit)

    return paginatedResponse(paginatedMembers, meta)
  } catch (error) {
    console.error('Team members GET error:', error)
    return serverErrorResponse('Failed to fetch team members')
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, inviteMemberSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { email, role, message } = parsed.data
    const orgId = auth.context.organizationId

    // Check if user is already a member
    const existingMember = mockTeamMembers.find(
      m => m.email === email && m.organizationId === orgId
    )
    if (existingMember) {
      return errorResponse('This user is already a member of your team', 400)
    }

    // Check user's permission to invite (only owner/admin can invite)
    const currentUserRole = mockTeamMembers.find(
      m => m.id === auth.context.userId && m.organizationId === orgId
    )?.role

    if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
      return errorResponse('You do not have permission to invite members', 403)
    }

    await delay(DELAY.MEDIUM)

    // In production, send invitation email and create pending invitation
    const invitation = {
      id: `inv-${Date.now()}`,
      email,
      role,
      message,
      organizationId: orgId,
      invitedBy: auth.context.userId,
      status: 'pending',
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + DURATIONS.INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    }

    return successResponse({
      invitation,
      message: `Invitation sent to ${email}`,
    }, 201)
  } catch (error) {
    console.error('Team invite POST error:', error)
    return serverErrorResponse('Failed to send invitation')
  }
}
