"use cache"

import type { Metadata } from "next"
import { Suspense } from "react"
import { getInvoicesData, getOrganizationIdOrNull } from "@/lib/ssr-data"
import { InvoicesClient } from "./invoices-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logError } from "@/lib/error-logger-simple"

export const metadata: Metadata = {
	title: "Invoices",
	description: "View and manage your invoices",
	openGraph: {
		title: "Invoices | Hypedrive",
		description: "View and manage your invoices",
	},
}

// Note: dynamic and revalidate exports removed - incompatible with cacheComponents

async function InvoicesData() {
	const orgId = await getOrganizationIdOrNull()

	if (!orgId) {
		return <InvoicesClient initialData={{ invoices: [], data: [], total: 0 }} />
	}

	try {
		const data = await getInvoicesData()
		return <InvoicesClient initialData={data} />
	} catch (error) {
		logError(error, { source: "InvoicesPage", data: { action: "fetch invoices data" } })
		return <InvoicesClient initialData={{ invoices: [], data: [], total: 0 }} />
	}
}

export default async function InvoicesPage() {
	// Industry Standard: Graceful null handling (no forced redirects)
	const orgId = await getOrganizationIdOrNull()

	return (
		<OrganizationGuard>
			<Suspense fallback={<div className="p-8">Loading invoices...</div>}>
				<InvoicesData />
			</Suspense>
		</OrganizationGuard>
	)
}
