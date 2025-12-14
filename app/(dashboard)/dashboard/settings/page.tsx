"use cache"

import { getSettingsData, requireOrganization } from "@/lib/ssr-data"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
	// Check if user has organization
	await requireOrganization()

	// Direct server fetch - pure RSC
	const data = await getSettingsData()

	return <SettingsClient initialData={data} />
}
