/**
 * Team React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import { STALE_TIME } from "@/lib/utils/query-config"
import * as actions from "../actions/team"

// ============================================
// Client Instance
// ============================================
const client = getEncoreBrowserClient()

// ============================================
// Query Keys
// ============================================
export const teamKeys = {
	all: (orgId: string) => ["team", orgId] as const,
	members: (orgId: string) => [...teamKeys.all(orgId), "members"] as const,
	invitations: (orgId: string) => [...teamKeys.all(orgId), "invitations"] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * Get team members
 */
export function useTeamMembers(orgId: string) {
	return useQuery({
		queryKey: teamKeys.members(orgId),
		queryFn: () => client.auth.listMembersAuth(),
		enabled: !!orgId,
		staleTime: STALE_TIME.SHORT,
	})
}

/**
 * Get team invitations
 */
export function useTeamInvitations(orgId: string) {
	return useQuery({
		queryKey: teamKeys.invitations(orgId),
		queryFn: () => client.organizations.listInvitations(orgId),
		enabled: !!orgId,
	})
}

// Alias for backward compatibility
export const useTeam = useTeamMembers

// ============================================
// MUTATIONS - Via Server Actions
// ============================================

/**
 * Invite team member
 */
export function useInviteMember(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ email, role }: { email: string; role: string }) => actions.inviteMember({ organizationId: orgId, email, role }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: teamKeys.members(orgId) })
			qc.invalidateQueries({ queryKey: teamKeys.invitations(orgId) })
		},
	})
}

/**
 * Remove team member
 */
export function useRemoveMember(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (memberId: string) => actions.removeMember({ organizationId: orgId, memberId }),
		onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.members(orgId) }),
	})
}

/**
 * Cancel invitation
 */
export function useCancelInvitation(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (invitationId: string) => actions.cancelInvitation({ organizationId: orgId, invitationId }),
		onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.invitations(orgId) }),
	})
}

/**
 * Update member role
 */
export function useUpdateMemberRole(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
			actions.updateMemberRole({ organizationId: orgId, memberId, role }),
		onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.members(orgId) }),
	})
}

// Re-export types
export type * from "../types"
