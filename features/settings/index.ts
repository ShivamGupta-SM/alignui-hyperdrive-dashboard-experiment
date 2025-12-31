/**
 * Settings Feature - Public API
 *
 * NOTE: Auth-related actions (updateProfile, changeEmail, deleteUser, 2FA, sessions)
 * are now sourced from @/features/auth. This file re-exports them for backward compatibility.
 */

// Types
export type * from "./types"

// Hooks
export {
	// Query Keys
	settingsKeys,
	// Queries
	useOrganizationSettings,
	useBankAccounts,
	useGstDetails,
	// useSettingsData removed - SSOT: Use individual hooks or useOrganizationById from @/features/organizations
	useOrganizationActivity,
	useUserSessions,
	// Mutations
	useUpdateProfile,
	useUpdateOrganizationSettings,
	useUpdatePassword,
	useUpdateNotifications,
	useAddBankAccount,
	useDeleteBankAccount,
	useSetDefaultBankAccount,
	useVerifyBankAccount,
	// NOTE: useVerifyGst removed - GST verification only happens during onboarding via /gst/verify-preview
	useEnable2FA,
	useVerify2FA,
	useDisable2FA,
	useChangeEmail,
	useDeleteUserAccount,
	useSendVerificationEmail,
	useRevokeSession,
	useRevokeAllSessions,
} from "./hooks/use-settings"

// Server Actions - Settings-specific
export {
	updateOrganization,
	updatePassword,
	updateNotifications,
	addBankAccount,
	removeBankAccount,
	setDefaultBankAccount,
	verifyBankAccount,
	getUserSessions,
	deleteOrganization,
	updateOrganizationLogo,
	removeOrganizationLogo,
} from "./actions/settings"

// Re-export auth actions for backward compatibility
// Source of truth: @/features/auth/actions/auth-actions.ts
export {
	updateProfile,
	changeEmail,
	deleteUser as deleteUserAccount,
	sendVerificationEmail,
	revokeSession,
	revokeOtherSessions as revokeAllSessions,
	enable2FA,
	disable2FA,
} from "@/features/auth/actions/auth-actions"

// SSR Data Fetching - Import directly from @/features/settings/ssr in server components
