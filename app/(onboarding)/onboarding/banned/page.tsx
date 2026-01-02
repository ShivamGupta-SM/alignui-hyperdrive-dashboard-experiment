"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { routes } from "@/lib/routes"
import { ProhibitInset, Headset, Envelope, Spinner, SignOut } from "@phosphor-icons/react"
import { Root as ButtonRoot } from "@/components/ui/primitives/button"
import { useOnboardingStatus } from "@/features/organizations/hooks/use-onboarding-status"
import { useSignOut } from "@/features/auth"

export default function BannedAccountPage() {
	const router = useRouter()
	const { signOut, isSigningOut } = useSignOut()

	// Use central hook for onboarding status (flattened state machine)
	const {
		state,
		isLoading,
		approvedOrgId,
		rejectionReason,
	} = useOnboardingStatus()

	// Track if we're redirecting to stop polling
	const isRedirectingRef = useRef(false)

	// Check if user has a banned org (flattened state - no more subState)
	const isBanned = state === "has_banned"

	// Handle redirects based on onboarding status
	useEffect(() => {
		if (isLoading || isRedirectingRef.current) return

		// Got approved somehow? Go to dashboard
		if (state === "ready" && approvedOrgId) {
			isRedirectingRef.current = true
			router.replace(`/dashboard/${approvedOrgId}`)
			return
		}

		// Not banned? Go to appropriate page based on flattened state
		if (!isBanned && state !== "loading") {
			isRedirectingRef.current = true
			if (state === "has_pending") {
				router.replace(routes.onboarding.pending)
			} else {
				router.replace(routes.onboarding.root)
			}
			return
		}
	}, [state, isLoading, approvedOrgId, router, isBanned])

	const handleSupportClick = () => {
		if (typeof window !== "undefined") {
			window.open("mailto:support@hypedrive.com?subject=Account%20Suspension%20Appeal")
		}
	}

	const handleSignOut = async () => {
		await signOut()
		// useSignOut hook already handles redirect
	}

	// Show loading while checking status or during redirect
	if (isLoading || !isBanned) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Spinner className="size-8 animate-spin text-primary-base" />
			</div>
		)
	}

	return (
		<div className="w-full max-w-md mx-auto text-center">
			<div className="rounded-xl sm:rounded-2xl bg-bg-white-0 p-6 sm:p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-sm">
				{/* Icon */}
				<div className="flex size-16 items-center justify-center rounded-full bg-error-lighter mx-auto mb-6">
					<ProhibitInset weight="duotone" className="size-8 text-error-base" />
				</div>

				{/* Title */}
				<h1 className="text-title-h4 text-text-strong-950 mb-2">Account Suspended</h1>
				<p className="text-paragraph-sm text-text-sub-600 mb-6">
					Your organization account has been suspended. Please contact our support team for assistance.
				</p>

				{/* Reason (if provided) */}
				{rejectionReason && (
					<div className="rounded-xl bg-error-lighter/50 p-4 sm:p-5 text-left mb-6 ring-1 ring-error-base/20">
						<h3 className="text-label-sm text-error-base mb-2">Reason for Suspension</h3>
						<p className="text-paragraph-sm text-text-sub-600">{rejectionReason}</p>
					</div>
				)}

				{/* What to do */}
				<div className="rounded-xl bg-bg-weak-50 p-4 sm:p-5 text-left mb-6">
					<h3 className="text-label-sm text-text-strong-950 mb-3">What Can You Do?</h3>
					<ul className="space-y-3 text-paragraph-sm text-text-sub-600">
						<li className="flex items-start gap-3">
							<Envelope weight="duotone" className="size-5 text-primary-base shrink-0 mt-0.5" />
							<span>Contact our support team to understand the reason for suspension</span>
						</li>
						<li className="flex items-start gap-3">
							<Headset weight="duotone" className="size-5 text-primary-base shrink-0 mt-0.5" />
							<span>Submit an appeal if you believe this was done in error</span>
						</li>
					</ul>
				</div>

				{/* Contact Info */}
				<div className="flex items-center justify-center gap-2 text-paragraph-sm text-text-sub-600 mb-6">
					<Envelope weight="duotone" className="size-4" />
					<span>support@hypedrive.com</span>
				</div>

				{/* Actions */}
				<div className="flex flex-col gap-3">
					<ButtonRoot
						variant="primary"
						className="w-full inline-flex items-center justify-center gap-2"
						onClick={handleSupportClick}
					>
						<Headset weight="duotone" className="size-5" />
						Contact Support
					</ButtonRoot>
					<ButtonRoot
						variant="ghost"
						className="w-full inline-flex items-center justify-center gap-2"
						onClick={handleSignOut}
						disabled={isSigningOut}
					>
						<SignOut weight="duotone" className="size-5" />
						{isSigningOut ? "Signing Out..." : "Sign Out"}
					</ButtonRoot>
				</div>
			</div>
		</div>
	)
}
