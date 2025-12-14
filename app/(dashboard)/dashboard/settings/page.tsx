"use cache: private"

import { getSettingsData, getOrganizationIdOrNull } from "@/lib/ssr-data"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
	// Industry Standard: Session-based active organization (single source of truth)
	// Check if user has organization (graceful - don't force redirect)
	const orgId = await getOrganizationIdOrNull()
	const hasOrganization = !!orgId

	// Fetch settings data if organization exists
	let data
	if (hasOrganization && orgId) {
		try {
			data = await getSettingsData()
		} catch (error) {
			console.error("[SettingsPage] Failed to fetch settings data:", error)
			data = {
				user: {
					id: "",
					name: "",
					email: "",
					phone: "",
					role: "owner",
					emailVerified: false,
					twoFactorEnabled: false,
				},
				organization: {
					id: "",
					name: "Organization",
					slug: "",
					phone: "",
					industry: "",
					email: "",
				},
				bankAccounts: [],
				gstDetails: null,
			}
		}
	} else {
		data = {
			user: {
				id: "",
				name: "",
				email: "",
				phone: "",
				role: "owner",
				emailVerified: false,
				twoFactorEnabled: false,
			},
			organization: {
				id: "",
				name: "Organization",
				slug: "",
				phone: "",
				industry: "",
				email: "",
			},
			bankAccounts: [],
			gstDetails: null,
		}
	}

	return <SettingsClient initialData={data} hasOrganization={hasOrganization} />
}
