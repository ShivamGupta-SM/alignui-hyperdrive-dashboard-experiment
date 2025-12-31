/**
 * Auth Feature - Public API
 *
 * IMPORTANT: This file exports both client hooks and server actions.
 * When importing for server actions only (like in app/actions/index.ts),
 * import directly from "./actions/auth-actions" instead of this file
 * to avoid the "use server can only export async functions" error.
 */

// Types
export type * from "./types"

// =============================================================================
// CLIENT-SIDE EXPORTS (Hooks, Query Keys, etc.)
// These should NOT be imported by files that re-export server actions
// =============================================================================
export {
	// Query Keys (object - not a function!)
	authKeys,
	// Queries
	useSession,
	useUser,
	useSessionData,
	useIsAuthenticated,
	useActiveMemberRole,
	useHasPermission,
	// Mutations
	useSignOut,
} from "./hooks/use-auth"

// =============================================================================
// SERVER ACTIONS
// =============================================================================
export {
	signInEmail,
	signUpEmail,
	signInSocial,
	signOut,
	forgotPassword,
	resetPassword,
	resetPasswordCallback,
	verifyEmail,
	getCurrentUser,
	getSession,
	verify2FATotp,
	verify2FAOtp,
	send2FAOtp,
	listLinkedAccounts,
	unlinkAccount,
	leaveOrganization,
	deleteUser,
	listDeviceSessions,
	revokeDeviceSession,
} from "./actions/auth-actions"

