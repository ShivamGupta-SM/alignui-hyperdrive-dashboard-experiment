/**
 * Settings Feature - Public API
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
	useSettingsData,
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
	useVerifyGst,
	useEnable2FA,
	useVerify2FA,
	useDisable2FA,
	useChangeEmail,
	useDeleteUserAccount,
	useSendVerificationEmail,
	useRevokeSession,
	useRevokeAllSessions,
} from "./hooks/use-settings"

// Server Actions
export {
	updateProfile,
	updateOrganization,
	updatePassword,
	updateNotifications,
	addBankAccount,
	removeBankAccount,
	setDefaultBankAccount,
	verifyBankAccount,
	enable2FA,
	verify2FA,
	disable2FA,
	changeEmail,
	deleteUserAccount,
	sendVerificationEmail,
	revokeSession,
	revokeAllSessions,
	getUserSessions,
} from "./actions/settings"

// SSR Data Fetching
export { getSettingsData, getProfileData } from "./ssr"
