import { getDashboardData, requireOrganization } from "@/lib/ssr-data"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
	// Check if user has organization before accessing dashboard
	await requireOrganization()

	// Direct server fetch - pure RSC, no React Query
	const data = await getDashboardData()

	return <DashboardClient initialData={data} />
}
