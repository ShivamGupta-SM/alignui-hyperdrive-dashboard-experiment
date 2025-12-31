/**
 * Enrollments Feature - Public API
 */

// Types
export type * from "./types"

// Hooks
export {
	// Query Keys
	enrollmentKeys,
	// Queries
	useEnrollments,
	useCampaignEnrollments,
	useEnrollment,
	useEnrollmentDetail,
	useEnrollmentTransitions,
	useEnrollmentPricing,
	useEnrollmentStats,
	// Mutations
	useUpdateEnrollmentStatus,
	useBulkApproveEnrollments,
	useBulkRejectEnrollments,
	useApproveEnrollment,
	useRejectEnrollment,
	useRequestChanges,
	useExtendDeadline,
	useExportEnrollments,
} from "./hooks/use-enrollments"

// Server Actions
export {
	updateEnrollmentStatus,
	requestChanges,
	exportEnrollments,
	extendDeadline,
	bulkUpdateEnrollments,
} from "./actions/enrollments"

// SSR Data Fetching - Import directly from @/features/enrollments/ssr in server components
