"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import * as Button from "@/components/ui/primitives/button"
import { Callout } from "@/components/ui/feedback/callout"
import { Envelope, CheckCircle, WarningCircle, ArrowLeft } from "@phosphor-icons/react"
import { getSafeRedirectUrl } from "@/lib/utils/url-validation"
import { TIMEOUTS } from "@/lib/constants"
import { routes } from "@/lib/routes"

function VerifyEmailContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const token = searchParams.get("token")
	const callbackURL = searchParams.get("callbackURL")
	const [isVerifying, setIsVerifying] = useState(!!token)
	const [isVerified, setIsVerified] = useState(false)
	const [error, setError] = useState("")
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		async function verifyEmail() {
			if (!token) {
				setIsVerifying(false)
				setError("Invalid or missing verification token")
				return
			}

			setIsLoading(true)
			try {
				const { verifyEmail } = await import("@/app/actions")
				// Validate callbackURL if provided
				const validatedCallbackURL = callbackURL
					? getSafeRedirectUrl(callbackURL, "/")
					: undefined
				const result = await verifyEmail({ token, callbackURL: validatedCallbackURL })

				if (result?.data?.success) {
					setIsVerified(true)
					// Refresh session to update emailVerified status
					router.refresh()
					// Redirect to callbackURL if provided and valid
					if (validatedCallbackURL) {
						setTimeout(() => {
							router.push(validatedCallbackURL)
						}, TIMEOUTS.SAVED_INDICATOR)
					}
				} else {
					setError(result?.serverError || "Failed to verify email")
				}
			} catch (err) {
				setError("Failed to verify email. Please try again.")
			} finally {
				setIsLoading(false)
				setIsVerifying(false)
			}
		}

		if (token) {
			verifyEmail()
		}
	}, [token, callbackURL, router])

	if (isVerifying || isLoading) {
		return (
			<div className="flex min-h-screen flex-col bg-bg-white-0">
				<header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
					<Button.Root variant="ghost" size="small" asChild>
						<Link href={routes.auth.signIn}>
							<Button.Icon><ArrowLeft className="size-5" /></Button.Icon>
							Back to Sign In
						</Link>
					</Button.Root>
				</header>

				<main className="flex flex-1 items-center justify-center px-4 py-12">
					<div className="w-full max-w-md">
						<div className="rounded-20 bg-bg-white-0 p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-regular text-center">
							<div className="flex size-12 items-center justify-center rounded-full bg-primary-lighter mx-auto mb-4 animate-pulse">
								<Envelope weight="duotone" className="size-6 text-primary-base" />
							</div>
							<p className="text-paragraph-sm text-text-sub-600">Verifying your email...</p>
						</div>
					</div>
				</main>
			</div>
		)
	}

	if (isVerified) {
		return (
			<div className="flex min-h-screen flex-col bg-bg-white-0">
				<header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
					<Button.Root variant="ghost" size="small" asChild>
						<Link href={routes.auth.signIn}>
							<Button.Icon><ArrowLeft className="size-5" /></Button.Icon>
							Back to Sign In
						</Link>
					</Button.Root>
				</header>

				<main className="flex flex-1 items-center justify-center px-4 py-12">
					<div className="w-full max-w-md">
						<div className="rounded-20 bg-bg-white-0 p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-regular">
							<div className="mb-8 text-center">
								<div className="flex size-12 items-center justify-center rounded-full bg-success-lighter mx-auto mb-4">
									<CheckCircle weight="fill" className="size-6 text-success-base" />
								</div>
								<h1 className="text-title-h4 text-text-strong-950 mb-2">Email Verified!</h1>
								<p className="text-paragraph-sm text-text-sub-600">
									Your email address has been successfully verified.
								</p>
							</div>

							<Button.Root variant="primary" className="w-full" asChild>
								<Link href={routes.dashboard.root}>Go to Dashboard</Link>
							</Button.Root>
						</div>
					</div>
				</main>
			</div>
		)
	}

	return (
		<div className="flex min-h-screen flex-col bg-bg-white-0">
			<header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
				<Button.Root variant="ghost" size="small" asChild>
					<Link href="/sign-in">
						<Button.Icon><ArrowLeft className="size-5" /></Button.Icon>
						Back to Sign In
					</Link>
				</Button.Root>
			</header>

			<main className="flex flex-1 items-center justify-center px-4 py-12">
				<div className="w-full max-w-md">
					<div className="rounded-20 bg-bg-white-0 p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-regular">
						<div className="mb-8 text-center">
							<div className="flex size-12 items-center justify-center rounded-full bg-error-lighter mx-auto mb-4">
								<WarningCircle weight="fill" className="size-6 text-error-base" />
							</div>
							<h1 className="text-title-h4 text-text-strong-950 mb-2">Verification Failed</h1>
							<p className="text-paragraph-sm text-text-sub-600">
								{error || "This verification link is invalid or has expired"}
							</p>
						</div>

						{error && (
							<Callout variant="error" size="sm" className="mb-6">
								{error}
							</Callout>
						)}

						<div className="space-y-4">
							<Button.Root variant="primary" className="w-full" asChild>
								<Link href={routes.auth.forgotPassword}>Request New Verification Email</Link>
							</Button.Root>
							<Button.Root variant="ghost" className="w-full" asChild>
								<Link href={routes.auth.signIn}>Back to Sign In</Link>
							</Button.Root>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

export default function VerifyEmailClient() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen flex-col bg-bg-white-0 items-center justify-center">
				<div className="animate-pulse text-text-sub-600">Loading...</div>
			</div>
		}>
			<VerifyEmailContent />
		</Suspense>
	)
}
