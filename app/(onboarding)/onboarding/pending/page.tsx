"use client"

import { useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { routes } from "@/lib/routes"
import { Envelope, Clock, Headset, ArrowsClockwise, Spinner } from "@phosphor-icons/react"
import { Root as ButtonRoot } from "@/components/ui/primitives/button"
import { useOnboardingStatus } from "@/features/organizations/hooks/use-onboarding-status"

export default function PendingApprovalPage() {
	const router = useRouter()

	// Use central hook for onboarding status (flattened state machine)
	const {
		state,
		isLoading,
		approvedOrgId,
		refetch
	} = useOnboardingStatus()

	// Track if we're redirecting to stop polling
	const isRedirectingRef = useRef(false)

	// Check if user has a pending org (flattened state - no more subState)
	const isPending = state === "has_pending"

	// Auto-poll every 30 seconds to check for approval
	useEffect(() => {
		// Don't start polling if not in pending state or already redirecting
		if (!isPending || isRedirectingRef.current) {
			return
		}

		const interval = setInterval(() => {
			if (!isRedirectingRef.current) {
				refetch()
			}
		}, 30000)

		return () => clearInterval(interval)
	}, [refetch, isPending])

	// Handle redirects based on onboarding status
	useEffect(() => {
		if (isLoading || isRedirectingRef.current) return

		// Got approved! Go to dashboard
		if (state === "ready" && approvedOrgId) {
			isRedirectingRef.current = true
			router.replace(`/dashboard/${approvedOrgId}`)
			return
		}

		// No pending org? Go to onboarding form
		if (!isPending && state !== "loading") {
			isRedirectingRef.current = true
			router.replace(routes.onboarding.root)
			return
		}
	}, [state, isLoading, approvedOrgId, router, isPending])

	const handleCheckStatus = useCallback(async () => {
		await refetch()
	}, [refetch])

	const handleSupportClick = useCallback(() => {
		if (typeof window !== "undefined") {
			window.open("mailto:support@hypedrive.com")
		}
	}, [])

	// Show loading while checking status or during redirect
	if (isLoading || !isPending) {
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
				<div className="flex size-16 items-center justify-center rounded-full bg-warning-lighter mx-auto mb-6">
					<Clock weight="duotone" className="size-8 text-warning-base" />
				</div>

				{/* Title */}
				<h1 className="text-title-h4 text-text-strong-950 mb-2">Application Submitted!</h1>
				<p className="text-paragraph-sm text-text-sub-600 mb-8">
					Your organization is pending approval. Our team will review your application and notify you
					via email once complete.
				</p>

				{/* What's Next */}
				<div className="rounded-xl bg-bg-weak-50 p-4 sm:p-5 text-left mb-6">
					<h3 className="text-label-sm text-text-strong-950 mb-3">What&apos;s Next?</h3>
					<ul className="space-y-3 text-paragraph-sm text-text-sub-600">
						<li className="flex items-start gap-3">
							<div className="flex size-6 items-center justify-center rounded-full bg-primary-base text-white text-label-xs shrink-0">
								1
							</div>
							<span>Our team reviews your GST and business details</span>
						</li>
						<li className="flex items-start gap-3">
							<div className="flex size-6 items-center justify-center rounded-full bg-primary-base text-white text-label-xs shrink-0">
								2
							</div>
							<span>You&apos;ll receive an email notification once approved</span>
						</li>
						<li className="flex items-start gap-3">
							<div className="flex size-6 items-center justify-center rounded-full bg-primary-base text-white text-label-xs shrink-0">
								3
							</div>
							<span>Complete your profile and fund your wallet</span>
						</li>
						<li className="flex items-start gap-3">
							<div className="flex size-6 items-center justify-center rounded-full bg-primary-base text-white text-label-xs shrink-0">
								4
							</div>
							<span>Start creating campaigns!</span>
						</li>
					</ul>
				</div>

				{/* Auto-refresh indicator */}
				<div className="flex items-center justify-center gap-2 text-paragraph-xs text-text-soft-400 mb-4">
					<ArrowsClockwise className="size-3.5" />
					<span>Auto-checking every 30 seconds</span>
				</div>

				{/* Contact Info */}
				<div className="flex items-center justify-center gap-2 text-paragraph-sm text-text-sub-600 mb-6">
					<Envelope weight="duotone" className="size-4" />
					<span>We&apos;ll notify you at your registered email</span>
				</div>

				{/* Actions */}
				<div className="flex flex-col gap-3">
					<ButtonRoot
						variant="primary"
						className="w-full inline-flex items-center justify-center gap-2"
						onClick={handleCheckStatus}
					>
						<ArrowsClockwise className="size-5" />
						Check Status Now
					</ButtonRoot>
					<ButtonRoot
						variant="ghost"
						className="w-full inline-flex items-center justify-center gap-2"
						onClick={handleSupportClick}
					>
						<Headset weight="duotone" className="size-5" />
						Contact Support
					</ButtonRoot>
				</div>
			</div>
		</div>
	)
}
