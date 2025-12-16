/**
 * Campaign Feature - Public API
 * 
 * @description
 * Single entry point for importing campaign feature.
 * Export only what other features/pages need.
 */

// Types
export type * from './types'

// Hooks
export {
  useSearchCampaigns,
  useCampaign,
  useCampaignWithStats,
} from './hooks/use-campaigns'

export {
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  useUpdateCampaignStatus,
} from './hooks/use-campaign-mutations'

// Actions
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
} from './actions/campaigns'

// Query Keys (for cache invalidation)
export { campaignQueryKeys } from './lib/query-keys'

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
} from './lib/validation'

