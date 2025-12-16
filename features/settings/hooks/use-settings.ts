/**
 * Settings React Query Hooks
 * 
 * @description
 * Standardized React Query hooks for settings data fetching.
 * Uses centralized API layer and query keys factory.
 */

"use client"

import { useQuery } from "@tanstack/react-query"
import { settingsQueryKeys } from '../lib/query-keys'
import {
	getOrganization,
	listBankAccounts,
	getGSTDetails,
	getSettingsData,
	getOrganizationActivity,
} from '../lib/api'
import { STALE_TIMES } from '@/lib/types'
import type {
	Organization,
	OrganizationBankAccount,
	GSTDetails,
	SettingsData,
} from '../types'

/**
 * Hook: Get organization settings
 * 
 * @description
 * Fetches organization settings from the API.
 * 
 * @param organizationId - Organization ID (or "me" for active org)
 * @returns React Query result with organization data
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useOrganizationSettings(orgId)
 * ```
 */
export function useOrganizationSettings(organizationId: string) {
	return useQuery({
		queryKey: settingsQueryKeys.organization(organizationId),
		queryFn: () => getOrganization(organizationId),
		enabled: !!organizationId,
		staleTime: STALE_TIMES.STATIC,
	})
}

/**
 * Hook: Get bank accounts
 * 
 * @description
 * Fetches bank accounts for the organization.
 * 
 * @param organizationId - Organization ID (for enabled check)
 * @returns React Query result with bank accounts
 */
export function useBankAccounts(organizationId: string) {
	return useQuery({
		queryKey: settingsQueryKeys.bankAccounts(),
		queryFn: () => listBankAccounts(),
		enabled: !!organizationId,
		staleTime: STALE_TIMES.STATIC,
	})
}

/**
 * Hook: Get GST details
 * 
 * @description
 * Fetches GST details for the organization.
 * 
 * @param organizationId - Organization ID (for enabled check)
 * @returns React Query result with GST details
 */
export function useGstDetails(organizationId: string) {
	return useQuery({
		queryKey: settingsQueryKeys.gst(),
		queryFn: () => getGSTDetails(),
		enabled: !!organizationId,
		staleTime: STALE_TIMES.STATIC,
	})
}

/**
 * Hook: Get all settings data (SSR hydration)
 * 
 * @description
 * Fetches all settings data for SSR hydration.
 * Used by the settings page to hydrate React Query cache.
 * 
 * @param organizationId - Organization ID
 * @returns React Query result with all settings data
 */
export function useSettingsData(organizationId: string) {
	return useQuery({
		queryKey: settingsQueryKeys.data(),
		queryFn: () => getSettingsData(organizationId),
		enabled: !!organizationId,
		staleTime: STALE_TIMES.STATIC,
	})
}

/**
 * Hook: Get organization activity
 * 
 * @description
 * Fetches organization activity feed.
 * 
 * @param organizationId - Organization ID
 * @param skip - Number of items to skip
 * @param take - Number of items to take
 * @returns React Query result with activity data
 */
export function useOrganizationActivity(
	organizationId: string,
	skip = 0,
	take = 20
) {
	return useQuery({
		queryKey: [...settingsQueryKeys.activity(organizationId), { skip, take }],
		queryFn: async () => {
			const response = await getOrganizationActivity({ skip, take })
			// Map action to type for component compatibility
			return {
				...response,
				data: (response.data as Array<{
					id: string
					action: string
					entityType: string
					entityId: string
					details: Record<string, unknown>
					adminName: string | null
					createdAt: string
				}>).map((item) => ({
					...item,
					type: item.action as import('../types').OrganizationActivityType,
					description: formatActivityDescription(item.action, item.entityType, item.details),
					actorName: item.adminName ?? undefined,
					actorAvatar: undefined,
				})),
			}
		},
		enabled: !!organizationId,
		staleTime: STALE_TIMES.STANDARD,
	})
}

// Helper to format activity description
function formatActivityDescription(
	action: string,
	entityType: string,
	details: Record<string, unknown>
): string {
	const actionDescriptions: Record<string, string> = {
		campaign_created: "created a new campaign",
		campaign_activated: "activated the campaign",
		campaign_paused: "paused the campaign",
		campaign_completed: "marked the campaign as completed",
		enrollment_approved: "approved an enrollment",
		enrollment_rejected: "rejected an enrollment",
		enrollment_bulk_approved: "bulk approved enrollments",
		withdrawal_requested: "requested a withdrawal",
		withdrawal_completed: "completed a withdrawal",
		member_invited: "invited a new team member",
		member_joined: "joined the team",
		member_removed: "removed a team member",
		invoice_generated: "generated an invoice",
		product_created: "added a new product",
		settings_updated: "updated organization settings",
	}

	const entityName = (details?.name as string) || (details?.title as string) || entityType
	const base = actionDescriptions[action] || `performed ${action.replace(/_/g, " ")}`

	return entityName && entityName !== entityType ? `${base}: ${entityName}` : base
}

