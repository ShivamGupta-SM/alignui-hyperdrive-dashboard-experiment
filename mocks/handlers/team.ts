/**
 * Team API Mock Handlers
 * 
 * Intercepts Encore API calls at localhost:4000/organizations/:orgId/members
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import {
  encoreUrl,
  encoreResponse,
  encoreListResponse,
  encoreErrorResponse,
  encoreNotFoundResponse,
} from './utils'
import { delay, DELAY } from '@/mocks/utils/delay'

// Transform database member to Encore Member format
function toEncoreMember(member: any) {
  return {
    id: member.id,
    visitorUserId: member.userId || member.id,
    organizationId: member.organizationId || '1',
    role: member.role,
    department: member.department || null,
    jobTitle: member.position || null,
    isActive: member.isActive ?? true,
    user: {
      name: member.name,
      email: member.email,
    },
    createdAt: member.joinedAt instanceof Date ? member.joinedAt.toISOString() : member.joinedAt,
  }
}

// Use database for invitations

export const teamHandlers = [
  // GET /organizations/:orgId/members - List team members
  http.get(encoreUrl('/organizations/:orgId/members'), async ({ params, request }) => {
    const { orgId } = params as { orgId: string }
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)
    const role = url.searchParams.get('role')

    let members = db.teamMembers.findMany((q) => q.where({ organizationId: orgId || '1' }))

    if (role && role !== 'all') {
      members = members.filter(m => m.role === role)
    }

    const total = members.length
    const paginatedMembers = members.slice(skip, skip + take)

    return encoreListResponse(paginatedMembers.map(toEncoreMember), total, skip, take)
  }),

  // GET /organizations/:orgId/members/:memberId - Get single member
  http.get(encoreUrl('/organizations/:orgId/members/:memberId'), async ({ params }) => {
    const { orgId, memberId } = params as { orgId: string; memberId: string }

    const member = db.teamMembers.findFirst((q) => q.where({ id: memberId, organizationId: orgId || '1' }))
    if (!member) {
      return encoreNotFoundResponse('Team member')
    }

    return encoreResponse(toEncoreMember(member))
  }),

  // PATCH /organizations/:orgId/members/:memberId - Update member role
  http.patch(encoreUrl('/organizations/:orgId/members/:memberId'), async ({ params, request }) => {
    const { orgId, memberId } = params as { orgId: string; memberId: string }
    const body = await request.json() as { role?: string }

    const member = db.teamMembers.findFirst((q) => q.where({ id: memberId, organizationId: orgId || '1' }))
    if (!member) {
      return encoreNotFoundResponse('Team member')
    }

    if (member.role === 'owner') {
      return encoreErrorResponse('Cannot change owner role', 400)
    }

    return encoreResponse(toEncoreMember({ ...member, role: body.role || member.role }))
  }),

  // DELETE /organizations/:orgId/members/:memberId - Remove member
  http.delete(encoreUrl('/organizations/:orgId/members/:memberId'), async ({ params }) => {
    const { orgId, memberId } = params as { orgId: string; memberId: string }

    const member = db.teamMembers.findFirst((q) => q.where({ id: memberId, organizationId: orgId || '1' }))
    if (!member) {
      return encoreNotFoundResponse('Team member')
    }

    if (member.role === 'owner') {
      return encoreErrorResponse('Cannot remove the organization owner', 400)
    }

    return encoreResponse({ deleted: true })
  }),

  // POST /organizations/:orgId/invitations - Send invitation
  http.post(encoreUrl('/organizations/:orgId/invitations'), async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const { orgId } = params as { orgId: string }
    const body = await request.json() as { email: string; role?: string }

    if (!body.email) {
      return encoreErrorResponse('Email is required', 400)
    }

    const invitation = {
      id: `inv-${Date.now()}`,
      organizationId: orgId,
      email: body.email,
      role: body.role || 'member',
      status: 'pending' as const,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }

    db.invitations.create({
      ...invitation,
      expiresAt: invitation.expiresAt.toISOString(),
    })

    return encoreResponse({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
    })
  }),

  // GET /organizations/:orgId/invitations - List invitations
  http.get(encoreUrl('/organizations/:orgId/invitations'), async ({ params }) => {
    const { orgId } = params as { orgId: string }

    const invitations = db.invitations.findMany((q) => q.where({ organizationId: orgId }))

    return encoreResponse({
      invitations: invitations.map(inv => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        status: inv.status,
        expiresAt: inv.expiresAt instanceof Date ? inv.expiresAt.toISOString() : inv.expiresAt,
      })),
    })
  }),

  // DELETE /organizations/:orgId/invitations/:invitationId - Cancel invitation
  http.delete(encoreUrl('/organizations/:orgId/invitations/:invitationId'), async ({ params }) => {
    const { invitationId } = params as { invitationId: string }

    const invitation = db.invitations.findFirst((q) => q.where({ id: invitationId }))
    if (!invitation) {
      return encoreNotFoundResponse('Invitation')
    }

    db.invitations.delete({ where: { id: invitationId } })
    return encoreResponse({ deleted: true })
  }),
]
