/**
 * Team API Mock Handlers
 */

import { http } from 'msw'
import { mockTeamMembers } from '@/lib/mocks'
import { DURATIONS, LIMITS } from '@/lib/types/constants'
import {
  delay,
  DELAY,
  getAuthContext,
  successResponse,
  notFoundResponse,
  errorResponse,
  paginatedResponse,
  calculatePagination,
  paginateArray,
} from './utils'

// Valid role values matching API schema
const VALID_ROLES = ['admin', 'manager', 'viewer'] as const
type TeamRole = typeof VALID_ROLES[number]

// Mock invitations storage
const mockInvitations: Array<{
  id: string
  email: string
  role: TeamRole
  message?: string
  organizationId: string
  invitedBy: string
  status: string
  sentAt: string
  expiresAt: string
}> = []

export const teamHandlers = [
  // GET /api/team - Get team members (used by useTeamMembers hook)
  http.get('/api/team', async ({ request }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)

    const role = url.searchParams.get('role')
    const search = url.searchParams.get('search')

    let members = mockTeamMembers.filter(m => m.organizationId === orgId)

    if (role) {
      members = members.filter(m => m.role === role)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      members = members.filter(m =>
        m.name.toLowerCase().includes(searchLower) ||
        m.email.toLowerCase().includes(searchLower)
      )
    }

    return successResponse(members)
  }),

  // GET /api/team/members
  http.get('/api/team/members', async ({ request }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)

    const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(url.searchParams.get('limit') || String(LIMITS.TEAM_MEMBERS_PAGE_SIZE), 10)
    const role = url.searchParams.get('role')
    const search = url.searchParams.get('search')

    let members = mockTeamMembers.filter(m => m.organizationId === orgId)

    if (role) {
      members = members.filter(m => m.role === role)
    }

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
  }),

  // GET /api/team/data
  http.get('/api/team/data', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId

    const members = mockTeamMembers.filter(m => m.organizationId === orgId)

    // Stats match TeamStats type from use-team.ts
    const stats = {
      total: members.length,
      admins: members.filter(m => m.role === 'admin' || m.role === 'owner').length,
      viewers: members.filter(m => m.role === 'viewer').length,
    }

    return successResponse({
      members,
      stats,
    })
  }),

  // GET /api/team/members/:id
  http.get('/api/team/members/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const member = mockTeamMembers.find(
      m => m.id === id && m.organizationId === auth.organizationId
    )

    if (!member) {
      return notFoundResponse('Team member')
    }

    return successResponse(member)
  }),

  // POST /api/team/members (Invite)
  // Schema: { email: z.string().email(), role: z.enum(['admin', 'manager', 'viewer']), message?: z.string().max(500) }
  http.post('/api/team/members', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const body = await request.json() as Record<string, unknown>

    const { email, role, message } = body as {
      email?: string
      role?: string
      message?: string
    }

    if (!email) {
      return errorResponse('Email is required', 400)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email address', 400)
    }

    if (!role) {
      return errorResponse('Role is required', 400)
    }

    // Validate role is one of the allowed values
    if (!VALID_ROLES.includes(role as TeamRole)) {
      return errorResponse(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 400)
    }

    // Validate message length if provided
    if (message && message.length > 500) {
      return errorResponse('Message must be at most 500 characters', 400)
    }

    // Check if user is already a member
    const existingMember = mockTeamMembers.find(
      m => m.email === email && m.organizationId === orgId
    )
    if (existingMember) {
      return errorResponse('This user is already a member of your team', 400)
    }

    // Check user's permission
    const currentUserRole = mockTeamMembers.find(
      m => m.id === auth.userId && m.organizationId === orgId
    )?.role

    if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
      return errorResponse('You do not have permission to invite members', 403)
    }

    const invitation = {
      id: `inv-${Date.now()}`,
      email,
      role: role as TeamRole,
      message,
      organizationId: orgId,
      invitedBy: auth.userId,
      status: 'pending',
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + DURATIONS.INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    }

    mockInvitations.push(invitation)

    return successResponse({
      invitation,
      message: `Invitation sent to ${email}`,
    }, 201)
  }),

  // PATCH /api/team/members/:id
  http.patch('/api/team/members/:id', async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params
    const body = await request.json() as Record<string, unknown>

    const member = mockTeamMembers.find(
      m => m.id === id && m.organizationId === auth.organizationId
    )

    if (!member) {
      return notFoundResponse('Team member')
    }

    // Check permissions
    const currentUserRole = mockTeamMembers.find(
      m => m.id === auth.userId && m.organizationId === auth.organizationId
    )?.role

    if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
      return errorResponse('You do not have permission to update team members', 403)
    }

    // Cannot change owner role
    if (member.role === 'owner' && body.role !== 'owner') {
      return errorResponse('Cannot change the role of an owner', 400)
    }

    const updatedMember = {
      ...member,
      ...body,
      updatedAt: new Date(),
    }

    return successResponse(updatedMember)
  }),

  // DELETE /api/team/members/:id
  http.delete('/api/team/members/:id', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const member = mockTeamMembers.find(
      m => m.id === id && m.organizationId === auth.organizationId
    )

    if (!member) {
      return notFoundResponse('Team member')
    }

    // Cannot remove owner
    if (member.role === 'owner') {
      return errorResponse('Cannot remove the owner from the team', 400)
    }

    // Check permissions
    const currentUserRole = mockTeamMembers.find(
      m => m.id === auth.userId && m.organizationId === auth.organizationId
    )?.role

    if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
      return errorResponse('You do not have permission to remove team members', 403)
    }

    return successResponse({ message: 'Team member removed successfully' })
  }),

  // GET /api/team/invitations
  http.get('/api/team/invitations', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId

    const invitations = mockInvitations.filter(i => i.organizationId === orgId)

    return successResponse(invitations)
  }),

  // DELETE /api/team/invitations/:id
  http.delete('/api/team/invitations/:id', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const invitationIndex = mockInvitations.findIndex(
      i => i.id === id && i.organizationId === auth.organizationId
    )

    if (invitationIndex === -1) {
      return notFoundResponse('Invitation')
    }

    mockInvitations.splice(invitationIndex, 1)

    return successResponse({ message: 'Invitation cancelled successfully' })
  }),
]
