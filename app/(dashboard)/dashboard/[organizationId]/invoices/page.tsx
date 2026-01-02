import type { Metadata } from "next"
import { Suspense } from "react"
import { getInvoicesData } from "@/features/invoices/ssr"
import { InvoicesClient } from "./invoices-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logError } from "@/lib/logging/error-logger-simple"
import InvoicesLoading from "./loading"

export const metadata: Metadata = {
	title: "Invoices",
	description: "View and manage your invoices",
	openGraph: {
		title: "Invoices | Hypedrive",
		description: "View and manage your invoices",
	},
}

interface PageProps {
	params: Promise<{ organizationId: string }>
}

async function InvoicesData({ organizationId }: { organizationId: string }) {
	try {
		// URL-based multi-tenancy: pass organizationId from URL params
		const data = await getInvoicesData(organizationId)
		return <InvoicesClient initialData={data} />
	} catch (error) {
		logError(error, { source: "InvoicesPage", data: { action: "fetch invoices data" } })
		return <InvoicesClient initialData={{ invoices: [] }} />
	}
}

export default async function InvoicesPage({ params }: PageProps) {
	const { organizationId } = await params
	return (
		<OrganizationGuard>
			<Suspense fallback={<InvoicesLoading />}>
				<InvoicesData organizationId={organizationId} />
			</Suspense>
		</OrganizationGuard>
	)
}
