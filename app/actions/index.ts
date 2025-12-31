/**
 * Re-export all server actions
 *
 * IMPORTANT: Import directly from action files, NOT from feature index files!
 * Feature index files export hooks (with objects like queryKeys) which cause
 * "use server" errors: "A use server file can only export async functions"
 */

// Campaign actions - Direct import to avoid client hooks (campaignKeys object)
export {
	createCampaign,
	updateCampaign,
	deleteCampaign,
	duplicateCampaign,
	updateCampaignStatus,
	exportCampaignEnrollments,
	updateCampaignPricing,
	validateCampaign,
	addCampaignDeliverable,
	addCampaignDeliverablesBatch,
	updateCampaignDeliverable,
	removeCampaignDeliverable,
} from "@/features/campaigns/actions/campaigns"

// Organization actions
export {
	getExistingDraftOrganization,
} from "@/features/organizations/actions/organizations"
export {
	resubmitOrganizationForApproval,
} from "@/features/organizations/actions/approval"

export {
	completeOnboarding,
	verifyGST,
} from "@/features/organizations/actions/onboarding"

// Enrollments actions
export {
	updateEnrollmentStatus,
	requestChanges,
	exportEnrollments,
} from "@/features/enrollments/actions/enrollments"

// Products actions
export {
	createProduct,
	updateProduct,
	deleteProduct,
	bulkImportProducts,
} from "@/features/products/actions/products"

// Wallet actions
export {
	requestWithdrawal,
	requestCredit,
} from "@/features/wallet/actions/wallet"

// Invoices actions
export {
	generateInvoicePDF,
	downloadInvoicePDF,
	getInvoiceEnrollmentIds,
	getEnrollmentsByIds,
} from "@/features/invoices/actions/invoices"

// Team actions
export {
	inviteMember,
	removeMember,
	cancelInvitation,
	updateMemberRole,
} from "@/features/team/actions/team"

// Settings actions
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
} from "@/features/settings/actions/settings"

// Auth actions
export {
	updateProfile,
	changeEmail,
	deleteUser as deleteUserAccount,
	sendVerificationEmail,
	revokeSession,
	revokeOtherSessions as revokeAllSessions,
	enable2FA,
	disable2FA,
	signInEmail,
	signInSocial,
	signUpEmail,
	verify2FATotp,
	verify2FAOtp,
	send2FAOtp,
	forgotPassword,
	resetPassword,
	resetPasswordCallback,
	getSession,
	getCurrentUser,
	signOut,
	verifyEmail,
	listLinkedAccounts,
	unlinkAccount,
	leaveOrganization,
	deleteUser,
	listDeviceSessions,
	revokeDeviceSession,
} from "@/features/auth/actions/auth-actions"
