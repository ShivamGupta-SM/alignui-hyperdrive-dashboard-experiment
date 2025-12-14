import { getEnrollmentDetailData, requireOrganization } from "@/lib/ssr-data"
import { EnrollmentDetailClient } from "./enrollment-detail-client"

export default async function EnrollmentDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	// Industry Standard: Session-based active organization (single source of truth)
	// Check if user has organization
	await requireOrganization()

	const { id } = await params

	// Direct server fetch - pure RSC
	const data = await getEnrollmentDetailData(id)

	return <EnrollmentDetailClient enrollmentId={id} initialData={data} />
}
