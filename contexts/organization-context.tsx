"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { organizations, auth } from "@/lib/api/encore-client"

/**
 * Organization Context
 * Simplified: Derives organization from session + organizations list
 * No separate API call - uses React Query data from useOrganizations hook
 */
interface OrganizationContextValue {
	organization: organizations.Organization | null
	organizationId: string | null
	hasOrganization: boolean
	isLoading: boolean
	error: Error | null
}

// CRITICAL FIX: Use createContext directly to avoid React null issues
// This prevents "Cannot read properties of null" errors during build/SSR
export const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined)

/**
 * Organization Provider
 * CRITICAL FIX: Hooks must be called unconditionally at top level
 * Solution: Always call hooks, but conditionally render based on environment
 */
export function OrganizationProvider({ children }: { children: ReactNode }) {
	// CRITICAL: Hooks must be called unconditionally at the top level
	// Cannot call hooks after conditional returns (violates Rules of Hooks)
	
	// Always call hooks - React will handle SSR properly
	const [ClientProvider, setClientProvider] = useState<React.ComponentType<{ children: ReactNode }> | null>(null)
	const [isClient, setIsClient] = useState(false)

	useEffect(() => {
		// Mark as client-side after mount
		setIsClient(true)
		
		// Dynamically import the client provider only on client-side after mount
		// This prevents Next.js from analyzing hooks during build
		import("./organization-context-wrapper").then((mod) => {
			setClientProvider(() => mod.ClientOrganizationProvider)
		}).catch((error) => {
			// Log error but don't crash
			console.error("[OrganizationProvider] Failed to load client provider:", error)
		})
	}, [])

	// Default context value for SSR/initial render
	const defaultContextValue: OrganizationContextValue = {
		organization: null,
		organizationId: null,
		hasOrganization: false,
		isLoading: !isClient || !ClientProvider,
		error: null,
	}

	// During SSR or before client provider loads, use default context
	if (!isClient || !ClientProvider) {
		return (
			<OrganizationContext.Provider value={defaultContextValue}>
				{children}
			</OrganizationContext.Provider>
		)
	}

	// Render the client provider that uses hooks
	return <ClientProvider>{children}</ClientProvider>
}

/**
 * Hook to access organization context
 * CRITICAL FIX: Use React.useContext for consistency and to prevent null errors
 */
export function useOrganizationContext() {
	// CRITICAL: Use useContext directly (imported from react)
	// This ensures we're using the same React instance and prevents null errors
	const context = useContext(OrganizationContext)

	// CRITICAL: During SSR/build, context might be undefined
	// Return safe default instead of throwing to prevent build errors
	if (context === undefined) {
		// Check if we're in a build/SSR context
		if (typeof window === "undefined") {
			// During SSR/build, return safe default
			return {
				organization: null,
				organizationId: null,
				hasOrganization: false,
				isLoading: true,
				error: null,
			}
		}
		// On client-side, throw error if context is missing
		throw new Error("useOrganizationContext must be used within OrganizationProvider")
	}

	return context
}

/**
 * Simplified hook for boolean check
 */
export function useHasOrganization() {
	const { hasOrganization } = useOrganizationContext()
	return hasOrganization
}

/**
 * Hook to get organization ID (with null safety)
 */
export function useOrganizationId(): string | null {
	const { organizationId } = useOrganizationContext()
	return organizationId
}
