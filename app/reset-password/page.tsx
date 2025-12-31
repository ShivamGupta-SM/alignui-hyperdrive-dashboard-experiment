import ResetPasswordClient from "./reset-password-client"

// Force dynamic rendering to prevent static generation errors
// This page uses useSearchParams which requires dynamic rendering
export const dynamic = "force-dynamic"

export default function ResetPasswordPage() {
	return <ResetPasswordClient />
}
