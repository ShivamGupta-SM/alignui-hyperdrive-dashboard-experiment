import type { Metadata } from "next"
import { Suspense } from "react"
import { getEnrollmentDetailData } from "@/features/enrollments/ssr"
import { EnrollmentDetailClient } from "./enrollment-detail-client"
import { logSSRError } from "@/lib/logging/error-logger-simple"

interface PageParams {
	organizationId: string
	id: string
}

export async function generateMetadata({
	params,
}: {
	params: Promise<PageParams>
}): Promise<Metadata> {
	const { id } = await params
	return {
		title: `Enrollment ${id}`,
		description: "View and manage enrollment details",
		openGraph: {
			title: `Enrollment ${id} | Hypedrive`,
			description: "View and manage enrollment details",
		},
	}
}

async function EnrollmentData({ organizationId, id }: { organizationId: string; id: string }) {
	let data = null
	try {
		data = await getEnrollmentDetailData(organizationId, id)
	} catch (error) {
		logSSRError(error, "getEnrollmentDetailData", "enrollment-detail", { data: { organizationId, enrollmentId: id } })
		data = null
	}

	return <EnrollmentDetailClient enrollmentId={id} initialData={data ?? undefined} />
}

export default async function EnrollmentDetailPage({
	params,
}: {
	params: Promise<PageParams>
}) {
	const { organizationId, id } = await params

	return (
		<Suspense fallback={<div className="p-8">Loading enrollment...</div>}>
			<EnrollmentData organizationId={organizationId} id={id} />
		</Suspense>
	)
}
