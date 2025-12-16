// Re-export all server actions
// All actions are now in features/ folders

// Campaign actions
export * from "@/features/campaigns"

// Organization actions
export {
	createBasicOrganization,
	switchOrganization,
	resubmitOrganizationForApproval,
	submitOnboarding,
	saveOnboardingDraft,
	loadOnboardingDraft,
} from "@/features/organizations"

// Enrollments actions
export {
	updateEnrollmentStatus,
	bulkUpdateEnrollments,
} from "@/features/enrollments"

// Products actions
export {
	createProduct,
	updateProduct,
	deleteProduct,
	bulkImportProducts,
} from "@/features/products"

// Wallet actions
export {
	requestWithdrawal,
	requestCredit,
} from "@/features/wallet"

// Invoices actions
export {
	generateInvoicePDF,
	downloadInvoicePDF,
	getInvoiceEnrollmentIds,
} from "@/features/invoices"

// Team actions
export {
	inviteMember,
	removeMember,
} from "@/features/team"

// Settings actions
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
	disable2FA,
	revokeSession,
	revokeAllSessions,
} from "@/features/settings"

// Auth actions
export {
	signInEmail,
	signInSocial,
	signUpEmail,
	verify2FATotp,
	send2FAOtp,
	forgotPassword,
	resetPassword,
	resetPasswordCallback,
	getSession,
	ensureActiveOrgAfterOAuth,
	verifyEmail,
} from "@/features/auth"
