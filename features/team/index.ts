/**
 * Team Feature - Public API
 *
 * This module exports hooks for:
 * 1. Organization Member Management (invitations, member list, role updates)
 * 2. Better Auth Teams (sub-groups within organizations)
 * 3. Dynamic Roles (custom role CRUD)
 * 4. Permission Checks (hasPermission queries)
 */

// Types
export type * from "./types"
export type { TeamMetadata, RoleResponse } from "./hooks/use-team"

// Hooks
export {
	// Query Keys
	teamKeys,

	// =========================================
	// ORGANIZATION MEMBER MANAGEMENT
	// =========================================
	// Queries
	useTeamMembers,
	useTeamInvitations,
	useTeam,
	// Mutations
	useInviteMember,
	useRemoveMember,
	useCancelInvitation,
	useUpdateMemberRole,
	// Invitation Hooks (Better Auth aligned)
	useGetInvitation,
	useAcceptInvitation,
	useRejectInvitation,

	// =========================================
	// BETTER AUTH TEAMS (Sub-groups)
	// =========================================
	// Queries
	useTeams,
	useUserTeams,
	useTeamMembersList,
	// Mutations
	useCreateTeam,
	useUpdateTeam,
	useRemoveTeam,
	useAddTeamMember,
	useRemoveTeamMember,
	useSetActiveTeam,

	// =========================================
	// DYNAMIC ROLES
	// =========================================
	// Queries
	useOrganizationRoles,
	useOrganizationRole,
	// Mutations
	useCreateOrganizationRole,
	useUpdateOrganizationRole,
	useDeleteOrganizationRole,

	// =========================================
	// PERMISSION CHECKS
	// =========================================
	useHasOrganizationPermission,
	// NOTE: useHasPermission is in @/features/auth
	useCheckPermission,
} from "./hooks/use-team"

// Server Actions
export { inviteMember, removeMember, cancelInvitation, updateMemberRole } from "./actions/team"

// SSR Data Fetching - Import directly from @/features/team/ssr in server components
