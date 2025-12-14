"use cache"

import { getInvoicesData, requireOrganization } from "@/lib/ssr-data"
import { InvoicesClient } from "./invoices-client"

export default async function InvoicesPage() {
	// Check if user has organization
	await requireOrganization()

	// Direct server fetch - pure RSC
	const data = await getInvoicesData()

	return <InvoicesClient initialData={data} />
}
