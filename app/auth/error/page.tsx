"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import * as Button from "@/components/ui/primitives/button"
import { Callout } from "@/components/ui/feedback/callout"
import { WarningCircle, ArrowLeft } from "@phosphor-icons/react"

/**
 * OAuth Error Page
 * 
 * Displays errors from OAuth callback failures
 * URL: /auth/error?error=...
 */
export default function AuthErrorPage() {
	const searchParams = useSearchParams()
	const error = searchParams.get("error")

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
							<h1 className="text-title-h4 text-text-strong-950 mb-2">Authentication Error</h1>
							<p className="text-paragraph-sm text-text-sub-600">
								{error || "An error occurred during authentication"}
							</p>
						</div>

						{error && (
							<Callout variant="error" size="sm" className="mb-6">
								{error}
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





