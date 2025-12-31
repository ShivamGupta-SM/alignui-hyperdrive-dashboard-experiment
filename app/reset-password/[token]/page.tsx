/**
 * Dynamic route for password reset: /reset-password/[token]
 *
 * This handles Better Auth's default password reset URL pattern.
 * Renders the same client component as the parent directory.
 */

import ResetPasswordPage from "../page"

// Auth pages require dynamic rendering
export const dynamic = "force-dynamic"

export default function ResetPasswordTokenPage() {
	return <ResetPasswordPage />
}
