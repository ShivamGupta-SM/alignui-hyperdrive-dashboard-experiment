/**
 * Organizations Feature - Public API
 *
 * URL-based multi-tenancy: organizationId from URL params
 * Components use useParams() directly - no context needed
 *
 * IMPORTANT: For getting current organization from URL, use:
 * import { useCurrentOrganization } from "@/hooks"
 *
 * This feature module exports organization-specific queries and mutations.
 */

// Types
export type * from "./types"

// Hooks
export {
	organizationKeys,
	useOrganizations,
	useOrganizationById,
	useOrganizationWithDetails,
	useOrganization,
	useUpdateOrganization,
	useOrganizationCampaignStats,
	useOrganizationStats,
	useBankAccount,
	useOrganizationInvitations,
	useRequestCreditIncrease,
	useUpdateBankAccount,
	useUpdateOrganizationLogo,
	useDashboardOverview,
} from "./hooks/use-organizations"

// Re-export SSOT useCurrentOrganization from hooks/shared for convenience
// This is the primary hook for getting organization from URL params
export { useCurrentOrganization } from "@/hooks/shared/use-current-organization"

// Onboarding Status
export {
	useOnboardingStatus,
	getRedirectUrl,
	getOnboardingMessage,
	ONBOARDING_ROUTES,
	type OnboardingState,
	type OnboardingSubState,
	type OnboardingStatus,
} from "./hooks/use-onboarding-status"

// Server Actions
export {
	completeOnboarding,
	verifyGST,
} from "./actions/onboarding"

// SSOT: CompleteOnboardingResult from types
export type { CompleteOnboardingResult } from "./types"

export {
	getExistingDraftOrganization,
} from "./actions/organizations"
