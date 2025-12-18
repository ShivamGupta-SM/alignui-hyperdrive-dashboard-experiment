import type { Metadata } from "next"
import { getEnrollmentDetailData } from "@/features/enrollments"
import { EnrollmentDetailClient } from "./enrollment-detail-client"
import { logSSRError } from "@/lib/logging/error-logger-simple"

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>
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

export default async function EnrollmentDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	// Industry Standard: Fetch data, let context handle organization state
	let data = null
	try {
		data = await getEnrollmentDetailData(id)
	} catch (error) {
		logSSRError(error, "getEnrollmentDetailData", "enrollment-detail", { data: { enrollmentId: id } })
		data = null
	}

	return <EnrollmentDetailClient enrollmentId={id} initialData={data ?? undefined} />
}
