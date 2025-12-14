"use cache: private"

import { getInvoicesData, requireOrganization } from "@/lib/ssr-data"
import { InvoicesClient } from "./invoices-client"

export default async function InvoicesPage() {
	// Industry Standard: Session-based active organization (single source of truth)
	try {
		// Check if user has organization
		await requireOrganization()

		// Direct server fetch - pure RSC
		const data = await getInvoicesData()

		return <InvoicesClient initialData={data} />
	} catch (error) {
		console.error("InvoicesPage error:", error)
		// Return empty state on error
		return <InvoicesClient initialData={{ invoices: [] }} />
	}
}
