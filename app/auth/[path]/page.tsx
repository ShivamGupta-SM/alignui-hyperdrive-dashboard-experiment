import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AuthPage({
    params
}: {
    params: Promise<{ path: string }>
}) {
    const { path } = await params

    // Redirect to specific auth pages
    if (path === 'sign-in') {
        redirect('/sign-in')
    }
    if (path === 'sign-up') {
        redirect('/sign-up')
    }
    if (path === 'callback') {
        // OAuth callback - handle in a separate page if needed
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-paragraph-sm text-text-sub-600">Processing authentication...</p>
            </div>
        )
    }
    if (path === 'sign-out') {
        // Sign out handled by server action
        redirect('/')
    }

    // Default: redirect to sign-in
    redirect('/sign-in')
}
