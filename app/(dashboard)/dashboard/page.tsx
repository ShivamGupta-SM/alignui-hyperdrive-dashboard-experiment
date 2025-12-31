import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getAuthenticatedEncoreClient } from "@/lib/api/server"
import { AUTH_COOKIE_PRIMARY } from "@/lib/constants"
import Link from "next/link"

// Error types that indicate auth is invalid (should redirect to sign-in)
function isAuthError(error: unknown): boolean {
	if (error instanceof Error) {
		const msg = error.message.toLowerCase()
		return msg.includes("unauthorized") || msg.includes("401") || msg.includes("invalid token") || msg.includes("session expired")
	}
	return false
}

/**
 * Dashboard Root Page
 *
 * Redirects user to their organization's dashboard or onboarding.
 */
export default async function DashboardRootPage() {
	const cookieStore = await cookies()
	const token = cookieStore.get(AUTH_COOKIE_PRIMARY)?.value

	if (!token) {
		redirect("/sign-in")
	}

	try {
		const client = getAuthenticatedEncoreClient(token)
		const orgsResult = await client.auth.listOrganizations()
		const organizations = orgsResult.organizations || []

		if (organizations.length === 0) {
			// No organizations - user needs onboarding
			redirect("/onboarding")
		}

		// Find first approved organization
		const approvedOrg = organizations.find(org => org.approvalStatus === "approved")
		if (approvedOrg) {
			redirect(`/dashboard/${approvedOrg.id}`)
		}

		// No approved org - check for pending
		const pendingOrg = organizations.find(org => org.approvalStatus === "pending")
		if (pendingOrg) {
			redirect("/onboarding/pending")
		}

		// No approved/pending - check for banned
		const bannedOrg = organizations.find(org => org.approvalStatus === "banned")
		if (bannedOrg) {
			redirect("/onboarding/banned")
		}

		// Only draft/rejected orgs - go to onboarding
		redirect("/onboarding")
	} catch (error) {
		// Only redirect to sign-in for auth errors (401, invalid token, etc)
		// For network errors, show error UI instead of logging user out
		if (isAuthError(error)) {
			redirect("/sign-in")
		}

		// Network/server error - show error UI
		return (
			<div className="flex h-full items-center justify-center min-h-[50vh]">
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="w-12 h-12 rounded-full bg-state-error-lighter flex items-center justify-center">
						<svg className="w-6 h-6 text-state-error-base" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<div>
						<p className="text-label-md text-text-strong-950">Unable to load dashboard</p>
						<p className="text-paragraph-sm text-text-soft-400 mt-1">
							Could not connect to server. Please check your connection.
						</p>
					</div>
					<Link
						href="/dashboard"
						className="mt-2 px-4 py-2 bg-primary-base text-white rounded-lg hover:bg-primary-darker transition-colors"
					>
						Try Again
					</Link>
				</div>
			</div>
		)
	}
}
