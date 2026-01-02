import type { Metadata } from "next"
import { Suspense } from "react"
import { getProfileData } from "@/features/settings/ssr"
import { ProfileClient } from "./profile-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logSSRError } from "@/lib/logging/error-logger-simple"
import { ProfilePageLoading } from "@/components/dashboard/loading-skeletons"

export const metadata: Metadata = {
	title: "Profile",
	description: "Manage your profile settings and preferences",
	openGraph: {
		title: "Profile | Hypedrive",
		description: "Manage your profile settings and preferences",
	},
}

async function ProfileData() {
	// Profile data is user-specific, but page is under [organizationId] route
	// OrganizationGuard validates user has access to org in URL
	let data = null
	try {
		data = await getProfileData()
	} catch (error) {
		logSSRError(error, "getProfileData", "profile-data", {})
		// Return null data - client will handle gracefully
	}

	return <ProfileClient initialData={data ?? undefined} />
}

export default async function ProfilePage() {
	return (
		<OrganizationGuard pageType="default">
			<Suspense fallback={<ProfilePageLoading />}>
				<ProfileData />
			</Suspense>
		</OrganizationGuard>
	)
}
