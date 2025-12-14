"use client"

import { useEffect } from "react"
import { PageError } from "@/components/error-boundary"
import { handleAuthError, isAuthError } from "@/lib/error-handler"

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Dashboard Error:", error)

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
