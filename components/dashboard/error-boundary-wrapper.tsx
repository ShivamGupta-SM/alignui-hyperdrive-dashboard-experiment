"use client"

import { ErrorBoundary } from "@/components/error-boundary"

/**
 * Client-side Error Boundary Wrapper
 * Wraps dashboard content to catch client-side errors
 */
export function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
	return <ErrorBoundary>{children}</ErrorBoundary>
}

