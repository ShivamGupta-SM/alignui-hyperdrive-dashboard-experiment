"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import * as Button from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { WarningCircle, ArrowLeft, CheckCircle } from "@phosphor-icons/react"
import Link from "next/link"

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
		let timeoutId1: NodeJS.Timeout | null = null
		let timeoutId2: NodeJS.Timeout | null = null
		let timeoutId3: NodeJS.Timeout | null = null

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
					// Wait a moment for backend to process
					await new Promise<void>((resolve) => {
						if (abortController.signal.aborted) return
						timeoutId1 = setTimeout(() => resolve(), 1000)
					})

					if (abortController.signal.aborted) return

					// Check if we have a session
					const { getSession, ensureActiveOrgAfterOAuth } = await import("@/app/actions/auth")
					const sessionResult = await getSession()

					if (abortController.signal.aborted) return

					if (sessionResult.success && sessionResult.session) {
						// ✅ FIX: Ensure active organization is set after OAuth login
						// This fixes the race condition and ensures active org is set before redirect
						try {
							const orgResult = await ensureActiveOrgAfterOAuth()
							if (abortController.signal.aborted) return

							if (orgResult.success && orgResult.activeOrgSet) {
								// Wait a bit more for session to refresh with active org
								await new Promise<void>((resolve) => {
									if (abortController.signal.aborted) return
									timeoutId2 = setTimeout(() => resolve(), 500)
								})
							}

							if (abortController.signal.aborted) return

							if (!abortController.signal.aborted) {
								setStatus("success")
								// Redirect to dashboard after ensuring active org is set
								timeoutId3 = setTimeout(() => {
									if (!abortController.signal.aborted) {
										router.push("/dashboard")
										router.refresh()
									}
								}, 1500)
							}
						} catch (orgError) {
							if (!abortController.signal.aborted) {
								const { logWarn } = await import("@/lib/error-logger-simple")
								logWarn("Failed to set active organization", { source: "OAuthCallback", data: { error: orgError } })
								// Log but don't fail - user can set manually later
							}
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
						setErrorMessage(
							err instanceof Error ? err.message : "Failed to complete authentication"
						)
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
			if (timeoutId1) clearTimeout(timeoutId1)
			if (timeoutId2) clearTimeout(timeoutId2)
			if (timeoutId3) clearTimeout(timeoutId3)
		}
	}, [code, state, error, router])

	if (status === "loading") {
		return (
			<div className="flex min-h-screen flex-col bg-bg-white-0">
				<header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
					<Button.Root variant="ghost" size="small" asChild>
						<Link href="/sign-in">
							<Button.Icon as={ArrowLeft} />
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
								Completing {provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "OAuth"} Sign In
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
						<Link href="/sign-in">
							<Button.Icon as={ArrowLeft} />
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
								<Link href="/dashboard">Go to Dashboard</Link>
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
						<Button.Icon as={ArrowLeft} />
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
								<Link href="/sign-in">Try Again</Link>
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




