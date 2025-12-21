/**
 * Team Feature - Public API
 */

// Types
export type * from "./types"

// Hooks
export {
	// Query Keys
	teamKeys,
	// Queries
	useTeamMembers,
	useTeamInvitations,
	useTeam,
	// Mutations
	useInviteMember,
	useRemoveMember,
	useCancelInvitation,
	useUpdateMemberRole,
} from "./hooks/use-team"

// Server Actions
export { inviteMember, removeMember, cancelInvitation, updateMemberRole } from "./actions/team"

// SSR Data Fetching - Import directly from @/features/team/ssr in server components
