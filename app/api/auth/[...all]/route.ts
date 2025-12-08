import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Dummy user for testing
const DUMMY_USER = {
	id: "dummy-user-123",
	email: "demo@example.com",
	name: "Demo User",
	image: "https://i.pravatar.cc/150?img=32",
	emailVerified: true,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
}

const DUMMY_SESSION = {
	id: "dummy-session-123",
	userId: DUMMY_USER.id,
	token: "dummy-token-abc123",
	expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
}

const SESSION_COOKIE_NAME = "better-auth.session_token"

async function isAuthenticated(): Promise<boolean> {
	const cookieStore = await cookies()
	return cookieStore.has(SESSION_COOKIE_NAME)
}

async function setSessionCookie() {
	const cookieStore = await cookies()
	cookieStore.set(SESSION_COOKIE_NAME, DUMMY_SESSION.token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 30 * 24 * 60 * 60, // 30 days
		path: "/",
	})
}

async function clearSessionCookie() {
	const cookieStore = await cookies()
	cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function GET(request: NextRequest) {
	const url = new URL(request.url)
	const path = url.pathname.replace("/api/auth", "")

	// Get session
	if (path === "/get-session") {
		const authenticated = await isAuthenticated()
		if (authenticated) {
			return NextResponse.json({
				session: DUMMY_SESSION,
				user: DUMMY_USER,
			})
		}
		return NextResponse.json({ session: null, user: null })
	}

	// Sign out
	if (path === "/sign-out") {
		await clearSessionCookie()
		return NextResponse.json({ success: true })
	}

	return NextResponse.json({ error: "Not found" }, { status: 404 })
}

export async function POST(request: NextRequest) {
	const url = new URL(request.url)
	const path = url.pathname.replace("/api/auth", "")

	try {
		const body = await request.json().catch(() => ({}))

		// Sign in with email/password
		if (path === "/sign-in/email") {
			// Accept any email/password for demo
			await setSessionCookie()
			return NextResponse.json({
				session: DUMMY_SESSION,
				user: {
					...DUMMY_USER,
					email: body.email || DUMMY_USER.email,
					name: body.email?.split("@")[0] || DUMMY_USER.name,
				},
			})
		}

		// Sign up
		if (path === "/sign-up/email") {
			await setSessionCookie()
			return NextResponse.json({
				session: DUMMY_SESSION,
				user: {
					...DUMMY_USER,
					email: body.email || DUMMY_USER.email,
					name: body.name || body.email?.split("@")[0] || DUMMY_USER.name,
				},
			})
		}

		// Sign out
		if (path === "/sign-out") {
			await clearSessionCookie()
			return NextResponse.json({ success: true })
		}

		// Get session (POST variant)
		if (path === "/get-session") {
			const authenticated = await isAuthenticated()
			if (authenticated) {
				return NextResponse.json({
					session: DUMMY_SESSION,
					user: DUMMY_USER,
				})
			}
			return NextResponse.json({ session: null, user: null })
		}

		// Forgot password - just pretend it worked
		if (path === "/forget-password") {
			return NextResponse.json({ success: true })
		}

		// Reset password - just pretend it worked
		if (path === "/reset-password") {
			return NextResponse.json({ success: true })
		}

		// Update user
		if (path === "/update-user") {
			return NextResponse.json({
				user: {
					...DUMMY_USER,
					...body,
				},
			})
		}

		// Change password
		if (path === "/change-password") {
			return NextResponse.json({ success: true })
		}

		// List sessions
		if (path === "/list-sessions") {
			const authenticated = await isAuthenticated()
			if (authenticated) {
				return NextResponse.json({
					sessions: [
						{
							...DUMMY_SESSION,
							userAgent: request.headers.get("user-agent") || "Unknown",
							ipAddress: "127.0.0.1",
						},
					],
				})
			}
			return NextResponse.json({ sessions: [] })
		}

		// Revoke session
		if (path === "/revoke-session") {
			return NextResponse.json({ success: true })
		}

		// Revoke other sessions
		if (path === "/revoke-other-sessions") {
			return NextResponse.json({ success: true })
		}

		return NextResponse.json({ error: "Not found" }, { status: 404 })
	} catch (error) {
		console.error("Auth API error:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
