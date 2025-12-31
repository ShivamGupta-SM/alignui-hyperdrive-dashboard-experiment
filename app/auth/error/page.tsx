import AuthErrorClient from "./auth-error-client"

// Force dynamic rendering to prevent static generation errors
// This page uses useSearchParams which requires dynamic rendering
export const dynamic = "force-dynamic"

/**
 * OAuth Error Page
 *
 * Displays errors from OAuth callback failures
 * URL: /auth/error?error=...
 */
export default function AuthErrorPage() {
	return <AuthErrorClient />
}
