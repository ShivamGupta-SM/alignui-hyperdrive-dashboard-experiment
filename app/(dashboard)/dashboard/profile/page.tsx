import { getProfileData } from "@/lib/ssr-data"
import { ProfileClient } from "./profile-client"

export default async function ProfilePage() {
	// Industry Standard: Session-based active organization (single source of truth)
	// Direct server fetch - pure RSC
	const data = await getProfileData()

	return <ProfileClient initialData={data} />
}
