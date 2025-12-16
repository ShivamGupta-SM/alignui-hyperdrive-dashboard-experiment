"use client"

import { Component, useEffect, type ReactNode, type ErrorInfo } from "react"
import Link from "next/link"
import * as Button from "@/components/ui/primitives/button"
import { ArrowClockwise, House, WarningCircle } from "@phosphor-icons/react"

interface ErrorBoundaryProps {
	children: ReactNode
	fallback?: ReactNode
}

interface ErrorBoundaryState {
	hasError: boolean
	error: Error | null
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log error to console in development
		console.error("Error Boundary caught an error:", error, errorInfo)

		// TODO: Send error to monitoring service (e.g., Sentry, LogRocket)
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: null })
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback
			}

			return (
				<div className="flex min-h-[400px] flex-col items-center justify-center p-8">
					<div className="flex size-16 items-center justify-center rounded-full bg-error-lighter mb-6">
						<WarningCircle className="size-8 text-error-base" weight="duotone" />
					</div>
					<h2 className="text-title-h5 text-text-strong-950 mb-2">Something went wrong</h2>
					<p className="text-paragraph-sm text-text-sub-600 text-center max-w-md mb-6">
						We encountered an unexpected error. Please try again or return to the dashboard.
					</p>
					{process.env.NODE_ENV === "development" && this.state.error && (
						<div className="mb-6 p-4 rounded-10 bg-bg-weak-50 max-w-lg w-full overflow-auto">
							<p className="text-paragraph-xs text-error-base font-mono">
								{this.state.error.message}
							</p>
						</div>
					)}
					<div className="flex items-center gap-3">
						<Button.Root variant="primary" onClick={this.handleRetry}>
							<Button.Icon>
								<ArrowClockwise className="size-5" />
							</Button.Icon>
							Try Again
						</Button.Root>
						<Link href="/dashboard">
							<Button.Root variant="neutral">
								<Button.Icon>
									<House className="size-5" />
								</Button.Icon>
								Go to Dashboard
							</Button.Root>
						</Link>
					</div>
				</div>
			)
		}

		return this.props.children
	}
}

/**
 * Error Fallback Component for use with React's error boundary patterns
 */
interface ErrorFallbackProps {
	error?: Error
	resetErrorBoundary?: () => void
	title?: string
	description?: string
}

export function ErrorFallback({
	error,
	resetErrorBoundary,
	title = "Something went wrong",
	description = "We encountered an unexpected error. Please try again.",
}: ErrorFallbackProps) {
	return (
		<div
			className="flex min-h-[300px] flex-col items-center justify-center p-8 rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200"
			role="alert"
			aria-live="assertive"
		>
			<div className="flex size-14 items-center justify-center rounded-full bg-error-lighter mb-4">
				<WarningCircle className="size-7 text-error-base" weight="duotone" aria-hidden="true" />
			</div>
			<h3 className="text-label-lg text-text-strong-950 mb-2">{title}</h3>
			<p className="text-paragraph-sm text-text-sub-600 text-center max-w-sm mb-4">{description}</p>
			{process.env.NODE_ENV === "development" && error && (
				<div className="mb-4 p-3 rounded-10 bg-bg-weak-50 max-w-md w-full overflow-auto">
					<p className="text-paragraph-xs text-error-base font-mono break-all">{error.message}</p>
				</div>
			)}
			{resetErrorBoundary && (
				<Button.Root variant="primary" onClick={resetErrorBoundary}>
					<Button.Icon>
						<ArrowClockwise className="size-5" />
					</Button.Icon>
					Try Again
				</Button.Root>
			)}
		</div>
	)
}

/**
 * Page-level Error Component for Next.js error.tsx files
 * CRITICAL: This component must NOT use any React context during prerender
 * It uses Button components which are safe (no context dependency)
 */
interface PageErrorProps {
	error: Error & { digest?: string }
	reset: () => void
}

export function PageError({ error, reset }: PageErrorProps) {
	useEffect(() => {
		// Log error to console
		console.error("Page Error:", error)
	}, [error])

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-8 bg-bg-white-0">
			<div className="flex size-20 items-center justify-center rounded-full bg-error-lighter mb-8">
				<WarningCircle className="size-10 text-error-base" weight="duotone" aria-hidden="true" />
			</div>
			<h1 className="text-title-h4 text-text-strong-950 mb-3">Oops! Something went wrong</h1>
			<p className="text-paragraph-md text-text-sub-600 text-center max-w-lg mb-8">
				We apologize for the inconvenience. An unexpected error has occurred. Please try again or
				contact support if the problem persists.
			</p>
		{process.env.NODE_ENV === "development" && (
			<details className="mb-8 w-full max-w-xl">
				<summary className="text-paragraph-xs text-text-sub-600 cursor-pointer mb-2">
					Error details (development only)
				</summary>
				<div className="p-4 rounded-10 bg-bg-weak-50 overflow-auto">
					<p className="text-paragraph-sm text-error-base font-mono break-all">{error.message}</p>
					{error.stack && (
						<pre className="text-paragraph-xs text-text-sub-600 font-mono mt-3 whitespace-pre-wrap break-all">
							{error.stack}
						</pre>
					)}
					{error.digest && (
						<p className="text-paragraph-xs text-text-soft-400 mt-3">Error ID: {error.digest}</p>
					)}
				</div>
			</details>
		)}
			<div className="flex items-center gap-4">
				<Button.Root variant="primary" size="medium" onClick={reset}>
					<Button.Icon>
						<ArrowClockwise className="size-5" />
					</Button.Icon>
					Try Again
				</Button.Root>
				<Link href="/dashboard">
					<Button.Root variant="neutral" size="medium">
						<Button.Icon>
							<House className="size-5" />
						</Button.Icon>
						Go to Dashboard
					</Button.Root>
				</Link>
			</div>
		</div>
	)
}
