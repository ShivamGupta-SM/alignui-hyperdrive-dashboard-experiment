/**
 * Auth Feature - Public API
 */

// Types
export type * from "./types"

// Hooks
export {
	// Query Keys
	authKeys,
	// Queries
	useSession,
	useUser,
	useSessionData,
	useIsAuthenticated,
	useOrganizations,
	// Mutations
	useSwitchOrganization,
	useSignOut,
} from "./hooks/use-auth"

// Server Actions
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
	ensureActiveOrgAfterOAuth,
} from "./actions/auth-actions"

// Legacy aliases for backward compatibility
export { signInEmail as signIn, signUpEmail as signUp } from "./actions/auth-actions"


