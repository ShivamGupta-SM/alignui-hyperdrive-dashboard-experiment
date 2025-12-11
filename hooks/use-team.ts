'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { organizations, auth } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'
import { teamKeys } from '@/lib/query-keys'

// Re-export keys for backwards compatibility
export { teamKeys }

// Re-export types from Encore for convenience
export type Member = organizations.Member
export type Invitation = auth.Invitation

// ============================================
// Types
// ============================================

export interface TeamStats {
  total: number
  admins: number
  viewers: number
}

export interface TeamData {
  members: Member[]
  invitations: Invitation[]
  stats: TeamStats
}

// ============================================
// Query Hooks
// ============================================

export function useTeamMembers(organizationId: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: teamKeys.members(),
    queryFn: () => client.organizations.listMembers(organizationId),
    enabled: !!organizationId,
    staleTime: STALE_TIMES.STANDARD,
  })
}

// ============================================
// SSR Hydration Hook
// ============================================

/**
 * Fetch team data for SSR hydration
 * Used by the team page to hydrate React Query cache
 */
export function useTeamData(organizationId: string, token?: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: teamKeys.data(),
    queryFn: async () => {
      const [membersData, invitationsData] = await Promise.all([
        client.organizations.listMembers(organizationId),
        token ? client.auth.listInvitations({ token, organizationId }) : Promise.resolve({ invitations: [] }),
      ])

      const members = membersData.data
      const invitations = invitationsData.invitations

      // Calculate stats from the data
      const admins = members.filter(m => m.role === 'admin' || m.role === 'owner').length
      const viewers = members.filter(m => m.role === 'member').length

      const stats: TeamStats = {
        total: members.length,
        admins,
        viewers,
      }

      return {
        members,
        invitations,
        stats,
      }
    },
    enabled: !!organizationId,
    staleTime: STALE_TIMES.STANDARD,
  })
}

// ============================================
// Invitation Hooks
// ============================================

/**
 * Fetch pending invitations
 */
export function useInvitations(organizationId: string, token?: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...teamKeys.all, 'invitations'] as const,
    queryFn: async () => {
      if (!token) return []
      const result = await client.auth.listInvitations({ token, organizationId })
      return result.invitations
    },
    enabled: !!organizationId && !!token,
    staleTime: STALE_TIMES.STANDARD,
  })
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Invite a new team member
 */
export function useInviteMember(organizationId: string, token?: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: { email: string; role: 'owner' | 'admin' | 'member' }) => {
      if (!token) throw new Error('Token required')
      return client.auth.inviteMemberAuth({
        token,
        organizationId,
        email: data.email,
        role: data.role,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}

/**
 * Remove a team member
 */
export function useRemoveMember(organizationId: string, token?: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (memberIdOrEmail: string) => {
      if (!token) throw new Error('Token required')
      return client.auth.removeMember({
        token,
        organizationId,
        memberIdOrEmail,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}

/**
 * Cancel a pending invitation
 */
export function useCancelInvitation(token?: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (invitationId: string) => {
      if (!token) throw new Error('Token required')
      return client.auth.cancelInvitation({ token, invitationId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}
