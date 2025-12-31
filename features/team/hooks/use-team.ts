/**
 * Team React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 *
 * NOTE: This file handles TWO distinct concepts:
 * 1. Organization Members (users who belong to an organization)
 * 2. Better Auth Teams (sub-groups within an organization for fine-grained access control)
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/api/client"
import { STALE_TIME, GC_TIME, DEFAULT_RETRY_CONFIG, createMutationErrorHandler, createQueryKeyFactory } from "@/lib/utils/query-config"
import { toast } from "sonner"
import * as actions from "../actions/team"
import type { auth } from "@/brand-client"
import { organizationKeys } from "@/features/organizations/hooks/use-organizations"
import { authKeys } from "@/features/auth/hooks/use-auth"

// Re-export types from brand-client for convenience
type TeamMetadata = auth.TeamMetadata
type RoleResponse = auth.RoleResponse

// ============================================
// Query Keys - Using factory + custom extensions
// ============================================
const baseKeys = createQueryKeyFactory("team")

export const teamKeys = {
	...baseKeys,
	// Organization member management
	members: (orgId: string) => ["team-members", orgId] as const,
	invitations: (orgId: string) => [...baseKeys.all(orgId), "invitations"] as const,
	invitation: (id: string) => ["invitation", id] as const,
	// Better Auth Teams (sub-groups within organization)
	teams: (orgId: string) => ["teams", orgId] as const,
	teamDetail: (orgId: string, teamId: string) => ["team-detail", orgId, teamId] as const,
	teamMembers: (orgId: string, teamId: string) => ["team-members", orgId, teamId] as const,
	userTeams: (orgId: string) => ["user-teams", orgId] as const,
	// Dynamic Roles
	roles: (orgId: string) => ["roles", orgId] as const,
	roleDetail: (orgId: string, roleId: string) => ["role-detail", orgId, roleId] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * Get team members
 * URL-based multi-tenancy: organizationId from URL params
 */
export function useTeamMembers(orgId: string) {
	return useQuery({
		queryKey: teamKeys.members(orgId),
		queryFn: () => client.auth.listMembersAuth(orgId),
		enabled: !!orgId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get team invitations
 */
export function useTeamInvitations(orgId: string) {
	return useQuery({
		queryKey: teamKeys.invitations(orgId),
		queryFn: () => client.auth.listInvitations(orgId),
		enabled: !!orgId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
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
			toast.success("Invitation sent successfully")
		},
		onError: createMutationErrorHandler("send invitation"),
	})
}

/**
 * Remove team member
 */
export function useRemoveMember(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (memberId: string) => actions.removeMember({ organizationId: orgId, memberId }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: teamKeys.members(orgId) })
			toast.success("Member removed successfully")
		},
		onError: createMutationErrorHandler("remove member"),
	})
}

/**
 * Cancel invitation
 */
export function useCancelInvitation(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (invitationId: string) => actions.cancelInvitation({ organizationId: orgId, invitationId }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: teamKeys.invitations(orgId) })
			toast.success("Invitation cancelled")
		},
		onError: createMutationErrorHandler("cancel invitation"),
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
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: teamKeys.members(orgId) })
			toast.success("Role updated successfully")
		},
		onError: createMutationErrorHandler("update member role"),
	})
}

// ============================================
// INVITATION HOOKS - Better Auth Aligned
// ============================================

/**
 * Get invitation details by ID
 * Used on invitation acceptance page
 */
export function useGetInvitation(invitationId: string) {
	return useQuery({
		queryKey: teamKeys.invitation(invitationId),
		queryFn: () => client.auth.getInvitation({ invitationId }),
		enabled: !!invitationId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.SHORT,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Accept an invitation
 * Adds user to organization after accepting
 */
export function useAcceptInvitation() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (invitationId: string) => {
			// First get the invitation to retrieve organizationId
			const invitationData = await client.auth.getInvitation({ invitationId })
			if (!invitationData.invitation) {
				throw new Error("Invitation not found or has expired")
			}
			const { organizationId } = invitationData.invitation
			return client.auth.acceptInvitation(organizationId, invitationId)
		},
		onSuccess: () => {
			// SSOT: Use organizationKeys.lists() for consistent cache invalidation
			qc.invalidateQueries({ queryKey: organizationKeys.lists() })
			toast.success("Invitation accepted! You've joined the organization.")
		},
		onError: createMutationErrorHandler("accept invitation"),
	})
}

/**
 * Reject an invitation
 */
export function useRejectInvitation() {
	return useMutation({
		mutationFn: async (invitationId: string) => {
			// First get the invitation to retrieve organizationId
			const invitationData = await client.auth.getInvitation({ invitationId })
			if (!invitationData.invitation) {
				throw new Error("Invitation not found or has expired")
			}
			const { organizationId } = invitationData.invitation
			return client.auth.rejectInvitation(organizationId, invitationId)
		},
		onSuccess: () => {
			toast.success("Invitation declined")
		},
		onError: createMutationErrorHandler("decline invitation"),
	})
}

// ============================================
// BETTER AUTH TEAMS - Sub-groups within Organization
// ============================================

/**
 * List teams in organization
 */
export function useTeams(orgId: string) {
	return useQuery({
		queryKey: teamKeys.teams(orgId),
		queryFn: () => client.auth.listTeams(orgId),
		enabled: !!orgId,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * List user's teams in organization
 */
export function useUserTeams(orgId: string) {
	return useQuery({
		queryKey: teamKeys.userTeams(orgId),
		queryFn: () => client.auth.listUserTeams(orgId),
		enabled: !!orgId,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * List members of a specific team
 */
export function useTeamMembersList(orgId: string, teamId: string) {
	return useQuery({
		queryKey: teamKeys.teamMembers(orgId, teamId),
		queryFn: () => client.auth.listTeamMembers(orgId, teamId),
		enabled: !!orgId && !!teamId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Create a new team in organization
 */
export function useCreateTeam(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: { name: string; metadata?: TeamMetadata }) =>
			client.auth.createTeam(orgId, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: teamKeys.teams(orgId) })
			toast.success("Team created successfully")
		},
		onError: createMutationErrorHandler("create team"),
	})
}

/**
 * Update team details
 */
export function useUpdateTeam(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ teamId, data }: { teamId: string; data: { name?: string; metadata?: TeamMetadata } }) =>
			client.auth.updateTeam(orgId, teamId, { data }),
		onSuccess: (_, { teamId }) => {
			qc.invalidateQueries({ queryKey: teamKeys.teams(orgId) })
			qc.invalidateQueries({ queryKey: teamKeys.teamDetail(orgId, teamId) })
			toast.success("Team updated successfully")
		},
		onError: createMutationErrorHandler("update team"),
	})
}

/**
 * Remove/delete a team
 */
export function useRemoveTeam(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (teamId: string) =>
			client.auth.removeTeam(orgId, teamId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: teamKeys.teams(orgId) })
			toast.success("Team deleted successfully")
		},
		onError: createMutationErrorHandler("delete team"),
	})
}

/**
 * Add a member to a team
 */
export function useAddTeamMember(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
			client.auth.addTeamMember(orgId, teamId, { userId }),
		onSuccess: (_, { teamId }) => {
			qc.invalidateQueries({ queryKey: teamKeys.teamMembers(orgId, teamId) })
			toast.success("Member added to team")
		},
		onError: createMutationErrorHandler("add member to team"),
	})
}

/**
 * Remove a member from a team
 */
export function useRemoveTeamMember(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
			client.auth.removeTeamMember(orgId, teamId, userId),
		onSuccess: (_, { teamId }) => {
			qc.invalidateQueries({ queryKey: teamKeys.teamMembers(orgId, teamId) })
			toast.success("Member removed from team")
		},
		onError: createMutationErrorHandler("remove member from team"),
	})
}

/**
 * Set active team for the current session
 */
export function useSetActiveTeam() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (teamId: string | null) =>
			client.auth.setActiveTeam({ teamId }),
		onSuccess: () => {
			// SSOT: Use authKeys.session() for consistent cache invalidation
			qc.invalidateQueries({ queryKey: authKeys.session() })
			toast.success("Active team updated")
		},
		onError: createMutationErrorHandler("set active team"),
	})
}

// ============================================
// DYNAMIC ROLES - Custom Role Management
// ============================================

/**
 * List organization roles
 */
export function useOrganizationRoles(orgId: string) {
	return useQuery({
		queryKey: teamKeys.roles(orgId),
		queryFn: () => client.auth.listOrganizationRoles(orgId),
		enabled: !!orgId,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get a specific organization role
 */
export function useOrganizationRole(orgId: string, roleId: string) {
	return useQuery({
		queryKey: teamKeys.roleDetail(orgId, roleId),
		queryFn: () => client.auth.getOrganizationRole(orgId, roleId),
		enabled: !!orgId && !!roleId,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Create a custom organization role
 */
export function useCreateOrganizationRole(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: { role: string; permission?: Record<string, string[]> }) =>
			client.auth.createOrganizationRole(orgId, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: teamKeys.roles(orgId) })
			toast.success("Role created successfully")
		},
		onError: createMutationErrorHandler("create role"),
	})
}

/**
 * Update an organization role
 */
export function useUpdateOrganizationRole(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ roleId, permission }: { roleId: string; permission?: Record<string, string[]> }) =>
			client.auth.updateOrganizationRole(orgId, roleId, { permission }),
		onSuccess: (_, { roleId }) => {
			qc.invalidateQueries({ queryKey: teamKeys.roles(orgId) })
			qc.invalidateQueries({ queryKey: teamKeys.roleDetail(orgId, roleId) })
			toast.success("Role updated successfully")
		},
		onError: createMutationErrorHandler("update organization role"),
	})
}

/**
 * Delete an organization role
 */
export function useDeleteOrganizationRole(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (roleId: string) =>
			client.auth.deleteOrganizationRole(orgId, roleId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: teamKeys.roles(orgId) })
			toast.success("Role deleted successfully")
		},
		onError: createMutationErrorHandler("delete role"),
	})
}

// ============================================
// PERMISSION CHECKS
// ============================================

/**
 * Check if user has specific permission in organization
 * Returns a query that can be used reactively
 */
export function useHasOrganizationPermission(
	orgId: string,
	permission: Record<string, string[]>,
	options?: { enabled?: boolean }
) {
	// FIX: Stable query key - serialize permission to avoid object reference issues
	const permissionKey = JSON.stringify(permission, Object.keys(permission).sort())
	return useQuery({
		queryKey: ["permission", orgId, permissionKey] as const,
		queryFn: () => client.auth.hasOrganizationPermission(orgId, { permission }),
		enabled: !!orgId && (options?.enabled !== false),
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

// NOTE: useHasPermission is in @/features/auth - import from there

/**
 * Imperative permission check (for use in event handlers)
 */
export function useCheckPermission() {
	return useMutation({
		mutationFn: (permissions: Record<string, string[]>) =>
			client.auth.hasPermission({ permissions }),
	})
}

// Types are exported from @/features/team (feature index)
// TeamMetadata and RoleResponse re-exported for backward compatibility
export type { TeamMetadata, RoleResponse }
