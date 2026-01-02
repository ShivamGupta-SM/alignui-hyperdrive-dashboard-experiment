/**
 * Campaign Feature - Public API
 *
 * Clean exports - no redundant layers
 */

// Types
export type * from "./types"

// Hooks (queries + mutations in one file)
export {
	// Query Keys
	campaignKeys,
	// Queries
	useCampaigns,
	useSearchCampaigns,
	useCampaign,
	useCampaignWithStats,
	useCampaignStats,
	useCampaignPricing,
	useCampaignPerformance,
	useDeliverableTypes,
	useDeliverableType,
	useCampaignDeliverables,
	useCampaignDeliverable,
	useDeliverableSubmission,
	useEnrollmentSubmissions,
	usePendingSubmissions,
	// Mutations
	useCreateCampaign,
	useUpdateCampaign,
	useDeleteCampaign,
	useUpdateCampaignStatus,
	useDuplicateCampaign,
	usePauseCampaign,
	useResumeCampaign,
	useEndCampaign,
	useExportCampaignEnrollments,
	useAddCampaignDeliverable,
	useAddCampaignDeliverablesBatch,
	useUpdateCampaignDeliverable,
	useRemoveCampaignDeliverable,
	// Direct client mutations
	useActivateCampaign,
	useArchiveCampaign,
	useUnarchiveCampaign,
	useSubmitForApproval,
	useUpdateCampaignPricing,
	useValidateCampaign,
} from "./hooks/use-campaigns"

// Server Actions (for direct use in components)
export {
	createCampaign,
	updateCampaign,
	deleteCampaign,
	duplicateCampaign,
	updateCampaignStatus,
	exportCampaignEnrollments,
	updateCampaignPricing,
	validateCampaign,
} from "./actions/campaigns"

// SSOT: Campaign status action type - from types
export { CAMPAIGN_STATUS_ACTIONS, type CampaignStatusAction } from "./types"

// Validation Schemas - Re-export from centralized validation file
export {
	campaignFormSchema,
	campaignSchema,
	createCampaignBodySchema,
	updateCampaignBodySchema,
	campaignStatusSchema,
	type CampaignFormInput,
	type CampaignFormData,
	type CreateCampaignBody,
	type UpdateCampaignBody,
} from "@/lib/utils"

// SSR Data Fetching - Import directly from @/features/campaigns/ssr in server components
