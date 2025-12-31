import type { Metadata } from "next"
import { Suspense } from "react"
import { getSettingsData } from "@/features/settings/ssr"
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

interface PageProps {
	params: Promise<{ organizationId: string }>
}

async function SettingsData({ organizationId }: { organizationId: string }) {
	try {
		const data = await getSettingsData(organizationId)
		// SSOT: Convert null to undefined to match SettingsClient interface
		return <SettingsClient initialData={data ?? undefined} />
	} catch (error) {
		logError(error, { source: "SettingsPage", data: { action: "fetch settings data" } })
		return <SettingsClient initialData={undefined} />
	}
}

export default async function SettingsPage({ params }: PageProps) {
	const { organizationId } = await params
	return (
		<OrganizationGuard pageType="default">
			<Suspense fallback={<div className="p-8">Loading settings...</div>}>
				<SettingsData organizationId={organizationId} />
			</Suspense>
		</OrganizationGuard>
	)
}
