/**
 * Organizations Feature Types
 * 
 * @description
 * Single source of truth for all organization-related types.
 */

import type { organizations, shared } from "@/lib/api/encore-client"

// Re-export from Encore client
export type Organization = organizations.Organization
export type OrganizationCampaignStats = organizations.OrganizationCampaignStats
export type OrganizationStats = organizations.OrganizationStats
export type ApprovalStatus = shared.ApprovalStatus
export type AccountTier = shared.AccountTier

