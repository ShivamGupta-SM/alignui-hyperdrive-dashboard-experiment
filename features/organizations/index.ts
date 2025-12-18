/**
 * Organizations Feature - Public API
 */

// Types
export type * from "./types"

// Hooks
export {
	// Query Keys
	organizationKeys,
	// Queries
	useOrganizations,
	useOrganizationById,
	useActiveOrganization,
	useOrganization,
	// Mutations
	useSwitchOrganization,
	// Helpers
	useNeedsOnboarding,
	useOrganizationStatus,
} from "./hooks/use-organizations"

// Server Actions - Onboarding
export { verifyGST, submitOnboarding, checkUserOrganizations } from "./actions/onboarding"

// Server Actions - Draft
export { saveOnboardingDraft, loadOnboardingDraft } from "./actions/draft"

// Server Actions - Approval
export { submitOrganizationForApproval, resubmitOrganizationForApproval } from "./actions/approval"

// Server Actions - Organizations
export { createBasicOrganization, switchOrganization } from "./actions/organizations"

// SSR Data Fetching
export { getDashboardData } from "./ssr"
