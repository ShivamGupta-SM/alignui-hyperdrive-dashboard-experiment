"use client"

import { ErrorBoundary } from "@/components/shared/error-boundary"

/**
 * Client-side Error Boundary Wrapper
 * Wraps dashboard content to catch client-side errors
 */
export function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
	return <ErrorBoundary>{children}</ErrorBoundary>
}





