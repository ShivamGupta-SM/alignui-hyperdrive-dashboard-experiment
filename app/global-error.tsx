"use client"

import { useEffect } from "react"
import { PageError } from "@/components/error-boundary"
import { handleAuthError, isAuthError } from "@/lib/error-handler"

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		// Handle session revoke/auth errors globally
		if (isAuthError(error)) {
			handleAuthError(error)
		}
	}, [error])

	// If it's an auth error, show loading while redirecting
	if (isAuthError(error)) {
		return (
			<html>
				<body>
					<div className="flex min-h-screen flex-col items-center justify-center">
						<p className="text-paragraph-sm text-text-sub-600">Redirecting to login...</p>
					</div>
				</body>
			</html>
		)
	}

	return (
		<html>
			<body>
				<PageError error={error} reset={reset} />
			</body>
		</html>
	)
}
