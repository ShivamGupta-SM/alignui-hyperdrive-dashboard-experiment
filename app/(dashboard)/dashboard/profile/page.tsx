import type { Metadata } from "next"
import { getProfileData } from "@/lib/ssr-data"
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

export default async function ProfilePage() {
	// Industry Standard: Session-based active organization (single source of truth)
	// Profile page doesn't require organization - it's user-specific
	// But we still fetch data gracefully
	let data = null
	try {
		data = await getProfileData()
	} catch (error) {
		logSSRError(error, "getProfileData", "profile-data", {})
		// Return null data - client will handle gracefully
	}

	return <ProfileClient initialData={data ?? undefined} />
}
