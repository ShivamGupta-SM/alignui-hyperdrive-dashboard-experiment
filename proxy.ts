/**
 * Next.js 16 Proxy - Route Protection
 * 
 * This proxy runs BEFORE requests reach your pages.
 * It's the FIRST line of defense for authentication.
 * 
 * Next.js 16 Standard: proxy.ts replaces middleware.ts
 * - Makes network boundary explicit
 * - Runs on Node.js runtime (more predictable)
 * 
 * Best Practices:
 * 1. Keep proxy lightweight (no heavy operations)
 * 2. Use cookies for session checking (fast)
 * 3. Redirect unauthenticated users early
 * 4. Don't do database queries here
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AUTH_COOKIE_NAMES } from "@/lib/constants"

/**
 * Proxy logging utility
 * Note: Proxy runs on Node.js runtime, so we can use standard logging
 */
function logProxy(message: string, data?: Record<string, unknown>) {
	// In production, these logs go to Node.js runtime logs
	// In development, they appear in terminal
	if (process.env.NODE_ENV === "development") {
		// eslint-disable-next-line no-console
		console.log(`[Proxy] ${message}`, data || "")
	}
}

export function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname

	// ============================================================================
	// 1. GET SESSION TOKEN FROM COOKIES
	// ============================================================================
	// SSOT: Use centralized auth cookie names from @/lib/constants
	let sessionCookie: { value: string } | undefined
	for (const cookieName of AUTH_COOKIE_NAMES) {
		const cookie = request.cookies.get(cookieName)
		if (cookie?.value) {
			sessionCookie = cookie
			break
		}
	}
	const isAuthenticated = !!sessionCookie?.value

	// ============================================================================
	// 2. DEFINE ROUTE CATEGORIES
	// ============================================================================

	// Protected routes - require authentication
	// Note: /onboarding is protected but has special handling below
	const protectedRoutes = ["/dashboard"]
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

	// Onboarding route - requires auth but should redirect if user has org
	const isOnboardingRoute = pathname.startsWith("/onboarding")

	// Auth routes - should redirect if already authenticated
	const authRoutes = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/verify-email", "/auth", "/invitations"]
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

	// Public routes - always accessible
	const publicRoutes = ["/", "/privacy", "/terms", "/demo"]
	const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/api")

	// ============================================================================
	// 3. PROTECTED ROUTES - Require Authentication
	// ============================================================================
	if (isProtectedRoute && !isAuthenticated) {
		// Save the intended destination for redirect after login
		const signInUrl = new URL("/sign-in", request.url)
		signInUrl.searchParams.set("redirect", pathname)

		logProxy("Redirecting unauthenticated user", { from: pathname, to: "/sign-in" })
		return NextResponse.redirect(signInUrl)
	}

	// ============================================================================
	// 3.5. ONBOARDING ROUTE - Special Handling
	// ============================================================================
	// Onboarding requires authentication but should NOT be forced
	// If user is not authenticated, allow them to access (they'll be redirected by auth flow)
	// If user IS authenticated, let the page component check if they have org
	// (We can't check org in proxy without API call, so let page handle it)
	if (isOnboardingRoute && !isAuthenticated) {
		// Redirect to sign-in, but preserve onboarding as redirect target
		const signInUrl = new URL("/sign-in", request.url)
		signInUrl.searchParams.set("redirect", "/onboarding")

		logProxy("Redirecting unauthenticated user from onboarding", { from: pathname, to: "/sign-in" })
		return NextResponse.redirect(signInUrl)
	}

	// ============================================================================
	// 4. AUTH ROUTES - Redirect if Already Authenticated (but allow onboarding)
	// ============================================================================
	// Don't redirect from auth routes if user is going to onboarding
	// New users need to complete onboarding first
	if (isAuthRoute && isAuthenticated && !isOnboardingRoute) {
		logProxy("Redirecting authenticated user from auth route", { from: pathname, to: "/dashboard" })
		return NextResponse.redirect(new URL("/dashboard", request.url))
	}

	// ============================================================================
	// 5. ROOT PAGE - Redirect Authenticated Users to Dashboard
	// ============================================================================
	if (pathname === "/" && isAuthenticated) {
		logProxy("Redirecting authenticated user from root", { to: "/dashboard" })
		return NextResponse.redirect(new URL("/dashboard", request.url))
	}

	// ============================================================================
	// 6. ALLOW REQUEST TO PROCEED
	// ============================================================================
	// Add custom headers if needed (e.g., user ID for server components)
	const response = NextResponse.next()

	// Optional: Add user info to headers for server components
	// This can be read in server components via headers()
	if (isAuthenticated && sessionCookie) {
		// You can decode the session token here if needed
		// For now, just pass it through
		response.headers.set("x-session-token", sessionCookie.value)
	}

	return response
}

// ============================================================================
// 7. MATCHER CONFIGURATION
// ============================================================================
// Define which routes this proxy should run on
// This is IMPORTANT for performance - don't run on static files
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - api routes (handled separately)
		 * - _next/static (static files)
		 * - _next/image (image optimization)
		 * - favicon.ico, robots.txt, sitemap.xml
		 * - public files (images, fonts, etc.)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)$).*)",
	],
}





