"use client"

import { useEffect } from "react"
import { PageError } from "@/components/error-boundary"
import { handleAuthError, isAuthError } from "@/lib/error-handler"
import { logError } from "@/lib/error-logger-simple"

interface ErrorProps {
	error: Error & { digest?: string }
	reset: () => void
}

export default function ProfileError({ error, reset }: ErrorProps) {
	useEffect(() => {
		logError(error, {
			source: "ProfileErrorBoundary",
			data: {
				digest: error.digest,
				message: error.message,
				stack: error.stack,
				component: "profile",
			},
		})

		// Handle session revoke/auth errors
		if (isAuthError(error)) {
			handleAuthError(error)
		}
	}, [error])

	// If it's an auth error, show loading while redirecting
	if (isAuthError(error)) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center">
				<p className="text-paragraph-sm text-text-sub-600">Redirecting to login...</p>
			</div>
		)
	}

	return <PageError error={error} reset={reset} />
}

