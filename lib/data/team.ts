// Server-side data fetching for team members
// This file uses the Encore backend client for type-safe API calls
import 'server-only'

import { getEncoreClient, type organizations as organizationsApi } from '@/lib/encore'
import { mockTeamMembers } from '@/lib/mocks'
import type { TeamMember } from '@/lib/types'

// Feature flag to control whether to use Encore or mock data
const USE_ENCORE = !!process.env.ENCORE_API_URL

/**
 * Convert Encore Member to Frontend TeamMember type
 */
function toFrontendTeamMember(member: organizationsApi.Member): TeamMember {
  return {
    id: member.id,
    organizationId: member.organizationId,
    name: member.user?.name || 'Unknown',
    email: member.user?.email || '',
    avatar: undefined,
    phone: undefined,
    role: member.role as TeamMember['role'],
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    joinedAt: new Date(),
  }
}

/**
 * Fetch team members from Encore backend
 */
async function fetchTeamMembersFromEncore(organizationId: string): Promise<TeamMember[]> {
  const client = getEncoreClient()
  const response = await client.organizations.listMembers(organizationId)
  return response.data.map(toFrontendTeamMember)
}

export async function getTeamMembers(organizationId?: string): Promise<TeamMember[]> {
  if (USE_ENCORE && organizationId) {
    try {
      return await fetchTeamMembersFromEncore(organizationId)
    } catch (error) {
      console.error('Failed to fetch team members from Encore, falling back to mocks:', error)
    }
  }
  return mockTeamMembers
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  return mockTeamMembers.find(m => m.id === id) || null
}

export interface TeamStats {
  total: number
  admins: number
  viewers: number
}

export interface TeamData {
  members: TeamMember[]
  stats: TeamStats
}

/**
 * Get all team data for SSR hydration
 */
export async function getTeamData(organizationId?: string): Promise<TeamData> {
  const members = await getTeamMembers(organizationId)

  const stats: TeamStats = {
    total: members.length,
    admins: members.filter(m => m.role === 'admin' || m.role === 'owner').length,
    viewers: members.filter(m => m.role === 'viewer').length,
  }

  return {
    members,
    stats,
  }
}
