"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import * as Button from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { CheckCircle, WarningCircle, ArrowLeft, Envelope } from "@phosphor-icons/react"
import { toast } from "sonner"

/**
 * Invitation Acceptance Page
 * 
 * Handles team member invitation acceptance
 * URL: /invitations/[id]/accept
 * 
 * Users click this link from invitation emails to accept and join an organization
 */
export default function AcceptInvitationPage() {
	const params = useParams()
	const router = useRouter()
	// useParams() returns a synchronous object in client components, not a Promise
	const invitationId = (params?.id as string) || ""

	const [status, setStatus] = useState<"loading" | "checking" | "success" | "error" | "needs-auth">("checking")
	const [errorMessage, setErrorMessage] = useState<string>("")
	const [isAccepting, setIsAccepting] = useState(false)

	// Check if user is authenticated and invitation is valid
	useEffect(() => {
		async function checkInvitation() {
			if (!invitationId) {
				setStatus("error")
				setErrorMessage("Invalid invitation ID")
				return
			}

			try {
				// Check if user is authenticated
				const { getSession } = await import("@/app/actions/auth")
				const sessionResult = await getSession()

				if (!sessionResult.success || !sessionResult.session) {
					// User not authenticated - redirect to sign-in with invitation ID
					setStatus("needs-auth")
					return
				}

				// User is authenticated - try to accept invitation
				setStatus("loading")
				await acceptInvitation()
			} catch (err) {
				setStatus("error")
				setErrorMessage(
					err instanceof Error ? err.message : "Failed to process invitation"
				)
			}
		}

		checkInvitation()
	}, [invitationId])

	async function acceptInvitation() {
		if (!invitationId || isAccepting) return

		setIsAccepting(true)
		try {
			const { getEncoreBrowserClient } = await import("@/lib/encore-browser")
			const client = getEncoreBrowserClient()

			const result = await client.auth.acceptInvitation({ invitationId })

			if (result.success) {
				setStatus("success")
				toast.success("Invitation accepted! You've been added to the organization.")
				// Redirect to dashboard after 2 seconds
				setTimeout(() => {
					router.push("/dashboard")
					router.refresh()
				}, 2000)
			} else {
				setStatus("error")
				setErrorMessage("Failed to accept invitation")
			}
		} catch (err) {
			setStatus("error")
			const errorMsg = err instanceof Error ? err.message : "Failed to accept invitation"
			setErrorMessage(errorMsg)
			
			// Check if it's an authentication error
			if (errorMsg.includes("unauthenticated") || errorMsg.includes("Unauthorized")) {
				setStatus("needs-auth")
			}
		} finally {
			setIsAccepting(false)
		}
	}

	if (status === "checking" || status === "loading") {
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
								<Envelope weight="duotone" className="size-6 text-primary-base" />
							</div>
							<h1 className="text-title-h4 text-text-strong-950 mb-2">Processing Invitation</h1>
							<p className="text-paragraph-sm text-text-sub-600">
								{status === "checking" ? "Checking invitation..." : "Accepting invitation..."}
							</p>
						</div>
					</div>
				</main>
			</div>
		)
	}

	if (status === "needs-auth") {
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
								<div className="flex size-12 items-center justify-center rounded-full bg-primary-lighter mx-auto mb-4">
									<Envelope weight="duotone" className="size-6 text-primary-base" />
								</div>
								<h1 className="text-title-h4 text-text-strong-950 mb-2">Sign In Required</h1>
								<p className="text-paragraph-sm text-text-sub-600">
									Please sign in to accept this invitation
								</p>
							</div>

							<div className="space-y-4">
								<Button.Root variant="primary" className="w-full" asChild>
									<Link href={`/sign-in?redirect=/invitations/${invitationId}/accept`}>
										Sign In to Accept
									</Link>
								</Button.Root>
								<Button.Root variant="ghost" className="w-full" asChild>
									<Link href="/sign-up">Create Account</Link>
								</Button.Root>
							</div>
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
						<Link href="/dashboard">
							<Button.Icon as={ArrowLeft} />
							Go to Dashboard
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
								<h1 className="text-title-h4 text-text-strong-950 mb-2">Invitation Accepted!</h1>
								<p className="text-paragraph-sm text-text-sub-600">
									You've been successfully added to the organization. Redirecting to dashboard...
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
							<h1 className="text-title-h4 text-text-strong-950 mb-2">Invitation Failed</h1>
							<p className="text-paragraph-sm text-text-sub-600">
								{errorMessage || "This invitation is invalid or has expired"}
							</p>
						</div>

						{errorMessage && (
							<Callout variant="error" size="sm" className="mb-6">
								{errorMessage}
							</Callout>
						)}

						<div className="space-y-4">
							<Button.Root variant="primary" className="w-full" asChild>
								<Link href="/sign-in">Go to Sign In</Link>
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



