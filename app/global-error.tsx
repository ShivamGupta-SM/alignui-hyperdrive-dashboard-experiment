// Minimal global-error.tsx - completely static, no React hooks, no context
// This prevents build-time useContext errors
// Next.js requires this file to exist for error handling

"use client"

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	// Return completely static HTML - no React, no hooks, no context, no imports
	// This prevents Next.js from analyzing React hooks/context during build
	// Using CSS custom properties that match our design system tokens
	return (
		<html>
			<body>
				<div
					className="flex min-h-screen flex-col items-center justify-center p-8 bg-bg-weak-50"
				>
					<div className="flex size-16 items-center justify-center rounded-full bg-error-lighter mb-6">
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							className="text-error-base"
							aria-hidden="true"
						>
							<path
								d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
					<h1 className="text-title-h4 text-text-strong-950 mb-2 text-center">
						Something went wrong
					</h1>
					<p className="text-paragraph-sm text-text-sub-600 mb-6 text-center max-w-md">
						An unexpected error occurred. Please try again or contact support if the problem persists.
					</p>
					<button
						type="button"
						onClick={reset}
						className="inline-flex items-center justify-center px-4 py-2.5 rounded-10 bg-primary-base text-white text-label-sm font-medium hover:bg-primary-darker focus:outline-none focus:ring-2 focus:ring-primary-base focus:ring-offset-2 transition-colors"
						aria-label="Retry loading the page"
					>
						Try again
					</button>
					{error.digest && (
						<p className="mt-4 text-paragraph-xs text-text-soft-400">
							Error ID: {error.digest}
						</p>
					)}
				</div>
			</body>
		</html>
	)
}



