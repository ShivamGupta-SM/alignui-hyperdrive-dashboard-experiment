"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import * as Button from "@/components/ui/primitives/button"
import { Callout } from "@/components/ui/feedback/callout"
import { WarningCircle, ArrowLeft, CheckCircle } from "@phosphor-icons/react"
import Link from "next/link"
import { getErrorMessage } from "@/lib/utils/format"
import { capitalizeFirst } from "@/lib/utils/string"
import { routes } from "@/lib/routes"

/**
 * OAuth Callback Handler Page
 * 
 * Handles OAuth provider callbacks (Google, GitHub, Microsoft)
 * URL: /auth/callback/[provider]
 * 
 * This page is shown while the backend processes the OAuth callback.
 * The backend will redirect to this page, which then processes the result.
 */
export default function OAuthCallbackPage() {
	const params = useParams()
	const router = useRouter()
	const searchParams = useSearchParams()
	// useParams() returns a synchronous object in client components, not a Promise
	const provider = (params?.provider as string) || ""
	const error = searchParams.get("error")
	const code = searchParams.get("code")
	const state = searchParams.get("state")

	const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
	const [errorMessage, setErrorMessage] = useState<string>("")

	useEffect(() => {
		const abortController = new AbortController()

		async function handleCallback() {
			if (error) {
				if (!abortController.signal.aborted) {
					setStatus("error")
					setErrorMessage(error || "OAuth authentication failed")
				}
				return
			}

			// If we have a code, the backend should have already processed it
			// Check session to see if we're authenticated
			if (code || state) {
				try {
					if (abortController.signal.aborted) return

					// Check if we have a session - no artificial delay needed
					// Backend processes OAuth synchronously before redirect
					const { getSession } = await import("@/app/actions")
					const sessionResult = await getSession({})

					if (abortController.signal.aborted) return

					if (sessionResult?.data?.session) {
						if (!abortController.signal.aborted) {
							setStatus("success")
							// Use replace() - user shouldn't go back to OAuth callback page
							router.replace(routes.dashboard.root)
							router.refresh()
						}
					} else {
						if (!abortController.signal.aborted) {
							setStatus("error")
							setErrorMessage("Failed to complete authentication")
						}
					}
				} catch (err) {
					if (!abortController.signal.aborted) {
						setStatus("error")
						setErrorMessage(getErrorMessage(err, "Failed to complete authentication"))
					}
				}
			} else {
				// No code or error - might be a direct visit
				if (!abortController.signal.aborted) {
					setStatus("error")
					setErrorMessage("Invalid callback parameters")
				}
			}
		}

		handleCallback()

		return () => {
			abortController.abort()
		}
	}, [code, state, error, router])

	if (status === "loading") {
		return (
			<div className="flex min-h-screen flex-col bg-bg-white-0">
				<header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
					<Button.Root variant="ghost" size="small" asChild>
						<Link href={routes.auth.signIn}>
							<Button.Icon>
								<ArrowLeft className="size-5" />
							</Button.Icon>
							Back to Sign In
						</Link>
					</Button.Root>
				</header>

				<main className="flex flex-1 items-center justify-center px-4 py-12">
					<div className="w-full max-w-md">
						<div className="rounded-20 bg-bg-white-0 p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-regular text-center">
							<div className="flex size-12 items-center justify-center rounded-full bg-primary-lighter mx-auto mb-4 animate-pulse">
								<CheckCircle weight="duotone" className="size-6 text-primary-base" />
							</div>
							<h1 className="text-title-h4 text-text-strong-950 mb-2">
								Completing {provider ? capitalizeFirst(provider) : "OAuth"} Sign In
							</h1>
							<p className="text-paragraph-sm text-text-sub-600">
								Please wait while we complete your authentication...
							</p>
						</div>
					</div>
				</main>
			</div>
		)
	}

	if (status === "success") {
		return (
			<div className="flex min-h-screen flex-col bg-bg-white-0">
				<header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
					<Button.Root variant="ghost" size="small" asChild>
						<Link href={routes.auth.signIn}>
							<Button.Icon>
								<ArrowLeft className="size-5" />
							</Button.Icon>
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
								<h1 className="text-title-h4 text-text-strong-950 mb-2">Sign In Successful!</h1>
								<p className="text-paragraph-sm text-text-sub-600">
									Redirecting to dashboard...
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
					<Link href={routes.auth.signIn}>
						<Button.Icon>
							<ArrowLeft className="size-5" />
						</Button.Icon>
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
							<h1 className="text-title-h4 text-text-strong-950 mb-2">Authentication Failed</h1>
							<p className="text-paragraph-sm text-text-sub-600">
								{errorMessage || "Failed to complete authentication"}
							</p>
						</div>

						{errorMessage && (
							<Callout variant="error" size="sm" className="mb-6">
								{errorMessage}
							</Callout>
						)}

						<div className="space-y-4">
							<Button.Root variant="primary" className="w-full" asChild>
								<Link href={routes.auth.signIn}>Try Again</Link>
							</Button.Root>
							<Button.Root variant="ghost" className="w-full" asChild>
								<Link href="/">Go Home</Link>
							</Button.Root>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}




