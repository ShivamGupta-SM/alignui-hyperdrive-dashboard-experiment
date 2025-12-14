"use cache"

import { getWalletData, requireOrganization } from "@/lib/ssr-data"
import { WalletClient } from "./wallet-client"
import { cookies } from "next/headers"

export default async function WalletPage() {
	// CRITICAL: Access request data (cookies) FIRST before any API calls
	// This ensures Next.js can properly handle static generation
	const cookieStore = await cookies()
	cookieStore.toString() // Touch cookies to mark as dynamic

	// Check if user has organization
	await requireOrganization()

	// Direct server fetch - pure RSC
	const data = await getWalletData()

	return <WalletClient initialData={data} />
}
