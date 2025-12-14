import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/auth/reset-password/[token]
 * 
 * Redirects Better Auth default password reset links to our frontend page.
 * Link from email: /api/auth/reset-password/{token}
 * Our Page: /reset-password?token={token}
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params

    // Create redirect URL to the actual page
    const redirectUrl = new URL("/reset-password", request.url)
    redirectUrl.searchParams.set("token", token)

    // Preserve callbackURL if present
    const callbackURL = request.nextUrl.searchParams.get("callbackURL")
    if (callbackURL) {
        redirectUrl.searchParams.set("callbackURL", callbackURL)
    }

    return NextResponse.redirect(redirectUrl)
}
