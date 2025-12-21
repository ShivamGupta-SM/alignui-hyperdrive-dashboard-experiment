/**
 * Next.js Middleware - Route Protection
 * 
 * This is the FIRST line of defense for authentication.
 * Runs BEFORE pages render, at the Edge Runtime.
 * 
 * Industry Standard: Defense in Depth
 * - Middleware: Fast cookie check (lightweight)
 * - Pages: Full auth validation (with API calls)
 * 
 * Best Practices:
 * 1. Keep middleware lightweight (no heavy operations)
 * 2. Use cookies for session checking (fast)
 * 3. Redirect unauthenticated users early
 * 4. Don't do database queries here
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ============================================================================
// ROUTE CONSTANTS - Centralized route definitions
// ============================================================================

/** Protected routes that require authentication */
const PROTECTED_ROUTES = ["/dashboard"] as const

/** Auth routes that should redirect if user is already authenticated */
const AUTH_ROUTES = [
	"/sign-in",
	"/sign-up",
	"/forgot-password",
	"/reset-password",
	"/verify-email",
	"/auth",
	"/invitations",
] as const

/** Public routes that are always accessible */
const PUBLIC_ROUTES = ["/", "/privacy", "/terms", "/demo"] as const

/** Cookie names to check for authentication */
const AUTH_COOKIE_NAMES = ["auth-token", "better-auth.session_token"] as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Middleware logging utility
 * Note: Middleware runs on Edge Runtime, so logging is limited
 */
function logMiddleware(message: string, data?: Record<string, unknown>) {
	// In production, these logs go to Edge Runtime logs
	// In development, they appear in terminal
	if (process.env.NODE_ENV === "development") {
		// eslint-disable-next-line no-console
		console.log(`[Middleware] ${message}`, data || "")
	}
}

/**
 * Check if user is authenticated based on cookies
 * 
 * @param request - Next.js request object
 * @returns True if authentication cookie exists
 */
function isAuthenticated(request: NextRequest): boolean {
	// Check all possible auth cookie names
	for (const cookieName of AUTH_COOKIE_NAMES) {
		const cookie = request.cookies.get(cookieName)
		if (cookie?.value) {
			return true
		}
	}
	return false
}

/**
 * Get authentication cookie value
 * 
 * @param request - Next.js request object
 * @returns Cookie value or null
 */
function getAuthCookie(request: NextRequest): string | null {
	for (const cookieName of AUTH_COOKIE_NAMES) {
		const cookie = request.cookies.get(cookieName)
		if (cookie?.value) {
			return cookie.value
		}
	}
	return null
}

/**
 * Check if pathname matches any protected route
 */
function isProtectedRoute(pathname: string): boolean {
	return PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
}

/**
 * Check if pathname matches any auth route
 */
function isAuthRoute(pathname: string): boolean {
	return AUTH_ROUTES.some((route) => pathname.startsWith(route))
}

/**
 * Check if pathname is a public route
 */
function isPublicRoute(pathname: string): boolean {
	return (
		PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number]) ||
		pathname.startsWith("/api")
	)
}

/**
 * Validate redirect URL to prevent open redirects
 * 
 * @param url - URL to validate
 * @param baseUrl - Base URL for the application
 * @returns True if URL is safe to redirect to
 */
function isValidRedirectUrl(url: string, baseUrl: string): boolean {
	try {
		const redirectUrl = new URL(url, baseUrl)
		// Only allow same-origin redirects
		return redirectUrl.origin === new URL(baseUrl).origin
	} catch {
		return false
	}
}

/**
 * Create safe redirect URL
 * 
 * @param pathname - Path to redirect to
 * @param request - Next.js request object
 * @returns Safe redirect URL
 */
function createSafeRedirectUrl(pathname: string, request: NextRequest): URL {
	const signInUrl = new URL("/sign-in", request.url)
	
	// Validate redirect pathname to prevent open redirects
	if (isValidRedirectUrl(pathname, request.url)) {
		signInUrl.searchParams.set("redirect", pathname)
	}
	
	return signInUrl
}

// ============================================================================
// MAIN MIDDLEWARE FUNCTION
// ============================================================================

export async function middleware(request: NextRequest) {
	try {
		const pathname = request.nextUrl.pathname

		// Skip middleware for public routes
		if (isPublicRoute(pathname)) {
			return NextResponse.next()
		}

		const authenticated = isAuthenticated(request)
		const sessionCookie = getAuthCookie(request)

		// ============================================================================
		// PROTECTED ROUTES - Require Authentication
		// ============================================================================
		if (isProtectedRoute(pathname) && !authenticated) {
			const signInUrl = createSafeRedirectUrl(pathname, request)
			logMiddleware("Redirecting unauthenticated user", {
				from: pathname,
				to: "/sign-in",
			})
			return NextResponse.redirect(signInUrl)
		}

		// ============================================================================
		// ONBOARDING ROUTE - Special Handling
		// ============================================================================
		const isOnboardingRoute = pathname.startsWith("/onboarding")
		if (isOnboardingRoute && !authenticated) {
			const signInUrl = createSafeRedirectUrl("/onboarding", request)
			logMiddleware("Redirecting unauthenticated user from onboarding", {
				from: pathname,
				to: "/sign-in",
			})
			return NextResponse.redirect(signInUrl)
		}

		// ============================================================================
		// AUTH ROUTES - Redirect if Already Authenticated
		// ============================================================================
		if (isAuthRoute(pathname) && authenticated && !isOnboardingRoute) {
			logMiddleware("Redirecting authenticated user from auth route", {
				from: pathname,
				to: "/dashboard",
			})
			return NextResponse.redirect(new URL("/dashboard", request.url))
		}

		// ============================================================================
		// ROOT PAGE - Redirect Authenticated Users to Dashboard
		// ============================================================================
		if (pathname === "/" && authenticated) {
			logMiddleware("Redirecting authenticated user from root", { to: "/dashboard" })
			return NextResponse.redirect(new URL("/dashboard", request.url))
		}

		// ============================================================================
		// ALLOW REQUEST TO PROCEED
		// ============================================================================
		const response = NextResponse.next()

		// Add session token to headers for server components
		if (authenticated && sessionCookie) {
			response.headers.set("x-session-token", sessionCookie)
		}

		return response
	} catch (error) {
		// Error handling: Log and allow request to proceed
		// Page components will handle authentication validation
		logMiddleware("Middleware error", {
			error: error instanceof Error ? error.message : String(error),
			pathname: request.nextUrl.pathname,
		})
		
		// Allow request to proceed - page will handle auth check
		return NextResponse.next()
	}
}

// ============================================================================
// MATCHER CONFIGURATION
// ============================================================================
// Define which routes this middleware should run on
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


