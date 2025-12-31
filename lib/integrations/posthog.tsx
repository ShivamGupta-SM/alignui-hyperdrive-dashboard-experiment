"use client"

import { ReactNode } from "react"

/**
 * PostHog Analytics Integration
 *
 * SETUP INSTRUCTIONS:
 * 1. Install: pnpm add posthog-js
 * 2. Set environment variables:
 *    - NEXT_PUBLIC_POSTHOG_KEY: Your PostHog project API key
 *    - NEXT_PUBLIC_POSTHOG_HOST: PostHog host (default: https://app.posthog.com)
 *
 * 3. Uncomment the implementation below and remove the stub
 *
 * EXAMPLE IMPLEMENTATION:
 * ```tsx
 * import posthog from "posthog-js"
 * import { PostHogProvider as PHProvider } from "posthog-js/react"
 *
 * if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
 *   posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
 *     api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
 *     person_profiles: "identified_only",
 *     capture_pageview: false, // We manually capture pageviews
 *   })
 * }
 *
 * export function PostHogProvider({ children }: { children: ReactNode }) {
 *   return <PHProvider client={posthog}>{children}</PHProvider>
 * }
 * ```
 *
 * @see https://posthog.com/docs/libraries/next-js
 */

// Stub provider - analytics disabled until configured
export function PostHogProvider({ children }: { children: ReactNode }) {
	return <>{children}</>
}

/**
 * Check if PostHog is configured
 */
export function isPostHogConfigured(): boolean {
	return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY)
}




