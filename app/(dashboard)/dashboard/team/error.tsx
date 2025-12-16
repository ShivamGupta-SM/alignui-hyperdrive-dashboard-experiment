"use client"

import { useEffect } from "react"
import { PageError } from "@/components/shared/error-boundary"
import { handleAuthError } from "@/lib/errors/error-handler"
import { isAuthenticationError } from "@/lib/errors/encore-error-handler"
import { logError } from "@/lib/logging/error-logger-simple"

interface ErrorProps {
	error: Error & { digest?: string }
	reset: () => void
}

export default function TeamError({ error, reset }: ErrorProps) {
	useEffect(() => {
		logError(error, {
			source: "TeamErrorBoundary",
			data: {
				digest: error.digest,
				message: error.message,
				stack: error.stack,
				component: "team",
			},
		})

		if (isAuthenticationError(error)) {
			handleAuthError(error)
		}
	}, [error])
	if (isAuthenticationError(error)) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center">
				<p className="text-paragraph-sm text-text-sub-600">Redirecting to login...</p>
			</div>
		)
	}

	return <PageError error={error} reset={reset} />
}



