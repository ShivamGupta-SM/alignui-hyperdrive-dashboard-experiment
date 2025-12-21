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
} from "./hooks/use-campaigns"

// Server Actions (for direct use in components)
export {
	createCampaign,
	updateCampaign,
	deleteCampaign,
	duplicateCampaign,
	updateCampaignStatus,
	pauseCampaign,
	resumeCampaign,
	endCampaign,
	exportCampaignEnrollments,
} from "./actions/campaigns"

// Validation Schemas
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
	type CampaignStatus as CampaignStatusSchema,
} from "./lib/validation"

// SSR Data Fetching - Import directly from @/features/campaigns/ssr in server components
