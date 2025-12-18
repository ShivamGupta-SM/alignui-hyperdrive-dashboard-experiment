/**
 * Centralized route helpers for URL-based multi-tenancy
 * All dashboard routes include organizationId
 */

import { useParams } from "next/navigation"

export const routes = {
	// Auth routes (no org)
	auth: {
		signIn: "/sign-in",
		signUp: "/sign-up",
		forgotPassword: "/forgot-password",
	},

	// Dashboard routes (org-scoped)
	dashboard: {
		root: "/dashboard",
		home: (orgId: string) => `/dashboard/${orgId}`,
		campaigns: {
			list: (orgId: string) => `/dashboard/${orgId}/campaigns`,
			create: (orgId: string) => `/dashboard/${orgId}/campaigns/create`,
			detail: (orgId: string, campaignId: string) => `/dashboard/${orgId}/campaigns/${campaignId}`,
		},
		products: {
			list: (orgId: string) => `/dashboard/${orgId}/products`,
			create: (orgId: string) => `/dashboard/${orgId}/products/new`,
			detail: (orgId: string, productId: string) => `/dashboard/${orgId}/products/${productId}`,
		},
		enrollments: {
			list: (orgId: string) => `/dashboard/${orgId}/enrollments`,
			detail: (orgId: string, enrollmentId: string) => `/dashboard/${orgId}/enrollments/${enrollmentId}`,
		},
		wallet: (orgId: string) => `/dashboard/${orgId}/wallet`,
		invoices: (orgId: string) => `/dashboard/${orgId}/invoices`,
		team: (orgId: string) => `/dashboard/${orgId}/team`,
		settings: (orgId: string) => `/dashboard/${orgId}/settings`,
		profile: (orgId: string) => `/dashboard/${orgId}/profile`,
		help: (orgId: string) => `/dashboard/${orgId}/help`,
	},

	// Onboarding
	onboarding: "/onboarding",
}

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
		products: routes.dashboard.products.list(orgId),
		productsCreate: routes.dashboard.products.create(orgId),
		productDetail: (id: string) => routes.dashboard.products.detail(orgId, id),
		enrollments: routes.dashboard.enrollments.list(orgId),
		enrollmentDetail: (id: string) => routes.dashboard.enrollments.detail(orgId, id),
		wallet: routes.dashboard.wallet(orgId),
		invoices: routes.dashboard.invoices(orgId),
		team: routes.dashboard.team(orgId),
		settings: routes.dashboard.settings(orgId),
		profile: routes.dashboard.profile(orgId),
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
