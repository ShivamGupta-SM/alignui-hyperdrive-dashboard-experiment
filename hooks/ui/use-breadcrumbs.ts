"use client"

import { useSelectedLayoutSegments } from "next/navigation"
import { useMemo } from "react"

export interface BreadcrumbItem {
	label: string
	href?: string
}

/** Route labels - customize display names here */
const ROUTE_LABELS: Record<string, string> = {
	campaigns: "Campaigns",
	enrollments: "Enrollments",
	wallet: "Wallet",
	products: "Products",
	invoices: "Invoices",
	team: "Team",
	settings: "Settings",
	profile: "Profile",
	create: "Create",
	edit: "Edit",
	new: "New",
}

/** Check if segment is a dynamic ID (UUID or numeric) */
const isIdSegment = (s: string) => /^[\da-f-]{36}$/i.test(s) || /^\d+$/.test(s)

/** Format segment: "new-campaign" -> "New Campaign" */
const formatSegment = (s: string) =>
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
export function useBreadcrumbs(basePath?: string): BreadcrumbItem[] {
	const segments = useSelectedLayoutSegments()

	return useMemo(() => {
		// Filter out organizationId (first segment after dashboard layout)
		const filtered = segments.filter((s, i) => !(i === 0 && isIdSegment(s)))
		if (!filtered.length) return []

		// Build breadcrumbs
		const base = basePath ?? `/dashboard/${segments[0]}`

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
	}, [segments, basePath])
}
