"use client"

import { useSelectedLayoutSegments, useParams } from "next/navigation"
import { useMemo } from "react"

export interface BreadcrumbItem {
	label: string
	href?: string
}

/**
 * Route labels - maps URL segments to display names
 * Synced with navigation items in sidebar.tsx
 */
const ROUTE_LABELS: Record<string, string> = {
	// Main navigation
	campaigns: "Campaigns",
	enrollments: "Enrollments",
	wallet: "Wallet",
	products: "Products",
	invoices: "Invoices",
	team: "Team",
	// Footer navigation
	settings: "Settings",
	help: "Help & Support",
	// Sub-routes
	profile: "Profile",
	create: "Create",
	edit: "Edit",
	new: "New",
} as const

/**
 * Check if segment is a dynamic ID
 * Supports: UUID (36 chars with dashes), CUID (25 chars), numeric IDs
 */
const isIdSegment = (s: string): boolean => {
	// UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
	if (/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(s)) return true
	// CUID: 25 alphanumeric chars starting with 'c'
	if (/^c[a-z0-9]{24}$/i.test(s)) return true
	// Numeric ID
	if (/^\d+$/.test(s)) return true
	return false
}

/** Format segment: "new-campaign" -> "New Campaign" */
const formatSegment = (s: string): string =>
	s.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

/**
 * Breadcrumbs hook using Next.js useSelectedLayoutSegments.
 * Automatically skips organizationId and generates proper breadcrumbs.
 *
 * @example
 * // URL: /dashboard/org-123/campaigns/456
 * // Returns: [
 * //   { label: 'Campaigns', href: '/dashboard/org-123/campaigns' },
 * //   { label: 'Details' }
 * // ]
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
	const segments = useSelectedLayoutSegments()
	const params = useParams<{ organizationId?: string }>()
	const organizationId = params.organizationId

	return useMemo(() => {
		// No segments or no organizationId = no breadcrumbs (we're at /dashboard)
		if (!segments.length || !organizationId) return []

		// Filter out organizationId from segments
		const filtered = segments.filter(s => s !== organizationId)
		if (!filtered.length) return []

		// Base path includes organizationId
		const base = `/dashboard/${organizationId}`

		return filtered.map((segment, i) => {
			const isLast = i === filtered.length - 1
			const path = `${base}/${filtered.slice(0, i + 1).join("/")}`

			if (isIdSegment(segment)) {
				return { label: "Details" }
			}

			return {
				label: ROUTE_LABELS[segment] || formatSegment(segment),
				href: isLast ? undefined : path,
			}
		})
	}, [segments, organizationId])
}
