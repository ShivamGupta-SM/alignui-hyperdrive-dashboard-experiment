"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Envelope, Clock, Headset } from "@phosphor-icons/react"

// Import Button directly - it's already a client component
import { Root as ButtonRoot } from "@/components/ui/primitives/button"

export default function PendingApprovalPage() {
	const router = useRouter()
	const [mounted, setMounted] = useState(false)
	
	useEffect(() => {
		setMounted(true)
	}, [])
	
	const handleDashboardClick = useCallback(() => {
		router.push("/dashboard")
	}, [router])
	
	const handleSupportClick = useCallback(() => {
		if (typeof window !== "undefined") {
			window.open("mailto:support@hypedrive.com")
		}
	}, [])
	
	if (!mounted) {
		return <div className="p-8">Loading...</div>
	}
	
	return (
		<div className="w-full max-w-md text-center">
			<div className="rounded-xl sm:rounded-2xl bg-bg-white-0 p-6 sm:p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-sm">
				{/* Icon */}
				<div className="flex size-16 items-center justify-center rounded-full bg-warning-lighter mx-auto mb-6">
					<Clock weight="duotone" className="size-8 text-warning-base" />
				</div>

				{/* Title */}
				<h1 className="text-title-h4 text-text-strong-950 mb-2">Application Submitted!</h1>
				<p className="text-paragraph-sm text-text-sub-600 mb-8">
					Your organization is pending approval. Our team will review your application within 24-48
					hours.
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

				{/* Contact Info */}
				<div className="flex items-center justify-center gap-2 text-paragraph-sm text-text-sub-600 mb-6">
					<Envelope weight="duotone" className="size-4" />
					<span>We&apos;ll notify you at your registered email</span>
				</div>

				{/* Actions */}
				<div className="flex flex-col gap-3">
					{mounted && (
						<>
							<ButtonRoot variant="primary" className="w-full" onClick={handleDashboardClick}>
								Go to Dashboard
							</ButtonRoot>
							<ButtonRoot variant="ghost" className="w-full inline-flex items-center gap-2" onClick={handleSupportClick}>
								<Headset weight="duotone" className="size-5" />
								Contact Support
							</ButtonRoot>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
