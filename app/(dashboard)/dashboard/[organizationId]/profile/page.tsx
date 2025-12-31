import type { Metadata } from "next"
import { Suspense } from "react"
import { getProfileData } from "@/features/settings/ssr"
import { ProfileClient } from "./profile-client"
import { logSSRError } from "@/lib/logging/error-logger-simple"

export const metadata: Metadata = {
	title: "Profile",
	description: "Manage your profile settings and preferences",
	openGraph: {
		title: "Profile | Hypedrive",
		description: "Manage your profile settings and preferences",
	},
}

async function ProfileData() {
	// Profile page doesn't require organization - it's user-specific
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
		<Suspense fallback={<div className="p-8">Loading profile...</div>}>
			<ProfileData />
		</Suspense>
	)
}
