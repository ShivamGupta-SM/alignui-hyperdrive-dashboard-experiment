/**
 * Organization Layout - Server-Side Ownership Validation
 *
 * URL-based multi-tenancy: organizationId from URL params
 *
 * ✅ Server-side ownership check - validates user owns/has access to org
 * ✅ No client-side data fetching (SSR handles this in page.tsx)
 * ✅ No loading spinners (page.tsx uses Suspense with skeleton)
 * ✅ Redirects unauthorized users to /dashboard
 */

import { redirect } from "next/navigation"
import { getAuthClient } from "@/lib/auth/server"

interface LayoutProps {
	children: React.ReactNode
	params: Promise<{ organizationId: string }>
}

export default async function OrganizationLayout({
	children,
	params,
}: LayoutProps) {
	const { organizationId } = await params

	try {
		// ✅ FIX: Server-side validation that user owns this organization
		const client = await getAuthClient()
		const { organizations } = await client.auth.listOrganizations()

		// Check if user has access to this organization AND it's approved
		const hasAccess = organizations?.some(
			org => org.id === organizationId && org.approvalStatus === "approved"
		)

		if (!hasAccess) {
			// User doesn't own this org or it's not approved
			// Redirect to dashboard which handles org selection
			redirect("/dashboard")
		}
	} catch {
		// Auth failed - redirect to sign-in
		redirect("/sign-in")
	}

	return <>{children}</>
}
