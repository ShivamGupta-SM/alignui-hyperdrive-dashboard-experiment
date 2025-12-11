import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "node:crypto"
import { DURATIONS } from "@/lib/types/constants"

// ============================================
// MOCK USER FOR DEVELOPMENT/TESTING
// ============================================
// This mock user is intentionally kept for development and testing purposes.
// In production, set ENABLE_MOCK_AUTH=false to disable mock authentication.
//
// Configure test credentials via environment variables:
//   MOCK_USER_EMAIL - default: demo@hypedrive.test
//   MOCK_USER_PASSWORD - default: Demo@123456
// ============================================

const IS_MOCK_AUTH_ENABLED = process.env.ENABLE_MOCK_AUTH === "true" || process.env.NODE_ENV === "development"

// Test user credentials from environment (only works when mock auth is enabled)
const TEST_USER = {
	email: process.env.MOCK_USER_EMAIL || "demo@hypedrive.test",
	password: process.env.MOCK_USER_PASSWORD || "Demo@123456",
}

function createMockUser(email: string, name?: string) {
	const id = crypto.createHash("sha256").update(email).digest("hex").slice(0, 16)
	return {
		id,
		email,
		name: name || email.split("@")[0],
		image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
		emailVerified: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}
}

function createSession(userId: string) {
	const sessionId = crypto.randomBytes(16).toString("hex")
	const token = crypto.randomBytes(32).toString("hex")
	return {
		id: sessionId,
		userId,
		token,
		expiresAt: new Date(Date.now() + DURATIONS.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}
}

const SESSION_COOKIE_NAME = "better-auth.session_token"

// In-memory session store (for development only - use a database in production)
const sessionStore = new Map<string, { user: ReturnType<typeof createMockUser>; session: ReturnType<typeof createSession> }>()

async function getSessionFromCookie(): Promise<{ user: ReturnType<typeof createMockUser>; session: ReturnType<typeof createSession> } | null> {
	const cookieStore = await cookies()
	const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
	if (!token) return null
	return sessionStore.get(token) || null
}

async function setSessionCookie(token: string) {
	const cookieStore = await cookies()
	cookieStore.set(SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: DURATIONS.SESSION_EXPIRY_DAYS * 24 * 60 * 60,
		path: "/",
	})
}

async function clearSessionCookie() {
	const cookieStore = await cookies()
	const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
	if (token) {
		sessionStore.delete(token)
	}
	cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function GET(request: NextRequest) {
	const url = new URL(request.url)
	const path = url.pathname.replace("/api/auth", "")

	// Get session
	if (path === "/get-session") {
		const sessionData = await getSessionFromCookie()
		if (sessionData) {
			return NextResponse.json({
				session: sessionData.session,
				user: sessionData.user,
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
			if (!IS_MOCK_AUTH_ENABLED) {
				return NextResponse.json({ error: "Authentication service not configured" }, { status: 503 })
			}

			const { email, password } = body
			if (!email || !password) {
				return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
			}

			// Validate credentials - only test user or proper email format in dev
			const isTestUser = email === TEST_USER.email && password === TEST_USER.password
			const isValidDevLogin = process.env.NODE_ENV === "development" && email && password.length >= 6

			if (!isTestUser && !isValidDevLogin) {
				return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
			}

			const user = createMockUser(email)
			const session = createSession(user.id)
			sessionStore.set(session.token, { user, session })
			await setSessionCookie(session.token)

			return NextResponse.json({ session, user })
		}

		// Sign up
		if (path === "/sign-up/email") {
			if (!IS_MOCK_AUTH_ENABLED) {
				return NextResponse.json({ error: "Authentication service not configured" }, { status: 503 })
			}

			const { email, password, name } = body
			if (!email || !password) {
				return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
			}

			if (password.length < 6) {
				return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
			}

			const user = createMockUser(email, name)
			const session = createSession(user.id)
			sessionStore.set(session.token, { user, session })
			await setSessionCookie(session.token)

			return NextResponse.json({ session, user })
		}

		// Sign out
		if (path === "/sign-out") {
			await clearSessionCookie()
			return NextResponse.json({ success: true })
		}

		// Get session (POST variant)
		if (path === "/get-session") {
			const sessionData = await getSessionFromCookie()
			if (sessionData) {
				return NextResponse.json({
					session: sessionData.session,
					user: sessionData.user,
				})
			}
			return NextResponse.json({ session: null, user: null })
		}

		// Forgot password
		if (path === "/forget-password") {
			const { email } = body
			if (!email) {
				return NextResponse.json({ error: "Email is required" }, { status: 400 })
			}
			// In production, this would send an email
			return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent" })
		}

		// Reset password
		if (path === "/reset-password") {
			const { token, password } = body
			if (!token || !password) {
				return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
			}
			if (password.length < 6) {
				return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
			}
			return NextResponse.json({ success: true })
		}

		// Update user
		if (path === "/update-user") {
			const sessionData = await getSessionFromCookie()
			if (!sessionData) {
				return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
			}
			const updatedUser = { ...sessionData.user, ...body }
			sessionStore.set(sessionData.session.token, { ...sessionData, user: updatedUser })
			return NextResponse.json({ user: updatedUser })
		}

		// Change password
		if (path === "/change-password") {
			const sessionData = await getSessionFromCookie()
			if (!sessionData) {
				return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
			}
			const { currentPassword, newPassword } = body
			if (!currentPassword || !newPassword) {
				return NextResponse.json({ error: "Current and new password are required" }, { status: 400 })
			}
			if (newPassword.length < 6) {
				return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
			}
			return NextResponse.json({ success: true })
		}

		// List sessions
		if (path === "/list-sessions") {
			const sessionData = await getSessionFromCookie()
			if (sessionData) {
				return NextResponse.json({
					sessions: [
						{
							...sessionData.session,
							userAgent: request.headers.get("user-agent") || "Unknown",
							ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "Unknown",
							isCurrent: true,
						},
					],
				})
			}
			return NextResponse.json({ sessions: [] })
		}

		// Revoke session
		if (path === "/revoke-session") {
			const { sessionId } = body
			if (!sessionId) {
				return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
			}
			return NextResponse.json({ success: true })
		}

		// Revoke other sessions
		if (path === "/revoke-other-sessions") {
			const sessionData = await getSessionFromCookie()
			if (!sessionData) {
				return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
			}
			return NextResponse.json({ success: true, message: "All other sessions have been revoked" })
		}

		return NextResponse.json({ error: "Not found" }, { status: 404 })
	} catch (error) {
		console.error("Auth API error:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
