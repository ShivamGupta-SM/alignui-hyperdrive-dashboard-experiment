"use client"

import { useEffect } from "react"
import { PageError } from "@/components/error-boundary"
import { handleAuthError, isAuthError } from "@/lib/error-handler"
import { logError } from "@/lib/error-logger-simple"

interface ErrorProps {
	error: Error & { digest?: string }
	reset: () => void
}

export default function SettingsError({ error, reset }: ErrorProps) {
	useEffect(() => {
		logError(error, {
			source: "SettingsErrorBoundary",
			data: {
				digest: error.digest,
				message: error.message,
				stack: error.stack,
				component: "settings",
			},
		})

		if (isAuthError(error)) {
			handleAuthError(error)
		}
	}, [error])
	if (isAuthError(error)) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center">
				<p className="text-paragraph-sm text-text-sub-600">Redirecting to login...</p>
			</div>
		)
	}

	return <PageError error={error} reset={reset} />
}


