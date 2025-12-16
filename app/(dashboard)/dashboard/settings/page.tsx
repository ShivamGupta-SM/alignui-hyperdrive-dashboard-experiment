import type { Metadata } from "next"
import { Suspense } from "react"
import { getSettingsData } from "@/lib/ssr-data"
import { SettingsClient } from "./settings-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logError } from "@/lib/logging/error-logger-simple"

export const metadata: Metadata = {
	title: "Settings",
	description: "Manage your organization settings, profile, and preferences",
	openGraph: {
		title: "Settings | Hypedrive",
		description: "Manage your organization settings, profile, and preferences",
	},
}


async function SettingsData() {
	try {
		const data = await getSettingsData()
		// Industry Standard: Don't pass hasOrganization prop - use context instead
		return <SettingsClient initialData={data} />
	} catch (error) {
		logError(error, { source: "SettingsPage", data: { action: "fetch settings data" } })
		// Industry Standard: Return undefined, let context handle organization state
		return <SettingsClient initialData={undefined} />
	}
}

export default async function SettingsPage() {
	// Industry Standard: Use OrganizationGuard for consistent UX
	return (
		<OrganizationGuard pageType="default">
			<Suspense fallback={<div className="p-8">Loading settings...</div>}>
				<SettingsData />
			</Suspense>
		</OrganizationGuard>
	)
}
