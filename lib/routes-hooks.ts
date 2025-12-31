"use client"

/**
 * Client-only route hooks for organization-scoped navigation
 * These hooks use useParams which requires client components
 */

import { useParams } from "next/navigation"
import { routes, PROFILE_TABS, SETTINGS_TABS } from "./routes"

/**
 * Hook to get routes with current organization
 * Must be used within [organizationId] route
 */
export function useDashboardRoutes() {
	const params = useParams<{ organizationId: string }>()
	const orgId = params.organizationId

	if (!orgId) {
		throw new Error("useDashboardRoutes must be used within [organizationId] route")
	}

	return {
		home: routes.dashboard.home(orgId),
		campaigns: routes.dashboard.campaigns.list(orgId),
		campaignsCreate: routes.dashboard.campaigns.create(orgId),
		campaignDetail: (id: string) => routes.dashboard.campaigns.detail(orgId, id),
		campaignEdit: (id: string) => routes.dashboard.campaigns.edit(orgId, id),
		products: routes.dashboard.products.list(orgId),
		productsCreate: routes.dashboard.products.create(orgId),
		productDetail: (id: string) => routes.dashboard.products.detail(orgId, id),
		enrollments: routes.dashboard.enrollments.list(orgId),
		enrollmentDetail: (id: string) => routes.dashboard.enrollments.detail(orgId, id),
		wallet: routes.dashboard.wallet(orgId),
		invoices: routes.dashboard.invoices(orgId),
		team: routes.dashboard.team(orgId),
		settings: (tab?: keyof typeof SETTINGS_TABS) => routes.dashboard.settings(orgId, tab),
		profile: (tab?: keyof typeof PROFILE_TABS) => routes.dashboard.profile(orgId, tab),
		help: routes.dashboard.help(orgId),
	}
}

/**
 * Hook to get current organization ID from URL
 * Must be used within [organizationId] route
 */
export function useOrganizationId(): string {
	const params = useParams<{ organizationId: string }>()

	if (!params.organizationId) {
		throw new Error("useOrganizationId must be used within [organizationId] route")
	}

	return params.organizationId
}
