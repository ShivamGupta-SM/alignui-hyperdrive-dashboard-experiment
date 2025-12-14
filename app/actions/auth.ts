"use server"

// Mocking disabled - removed MSW initialization

import { getEncoreClient, getAuthenticatedEncoreClient, handleAPIError, getErrorDetails } from "@/lib/encore"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import type { auth } from "@/lib/encore-client"
import { logDebug } from "@/lib/debug"

/**
 * Sign in with email and password
 */
export async function signInEmail(email: string, password: string, rememberMe?: boolean) {
	// Mocking disabled - removed MSW initialization
	
	const client = getEncoreClient()

	try {
		console.log("[SignIn] 🔵 Calling client.auth.signInEmail...")
		const result = await client.auth.signInEmail({ email, password, rememberMe })
		console.log("[SignIn] ✅ Sign-in successful, result:", {
			hasUser: !!result.user,
			hasToken: !!result.token,
			redirect: result.redirect
		})

		// Handle 2FA redirect if needed
		if (result.twoFactorRedirect) {
			return {
				success: true,
				requiresTwoFactor: true,
				twoFactorToken: result.twoFactorToken,
			}
		}

		// Handle redirect if needed
		if (result.redirect && result.url) {
			redirect(result.url)
		}

		// Set auth cookie if token is returned
		// Note: Better Auth also sets "better-auth.session_token" cookie via createSessionCookie()
		// We set "auth-token" cookie to match Better Auth's behavior:
		// - rememberMe = true (or undefined) → 7 days (matches Better Auth's createSessionCookie)
		// - rememberMe = false → 24 hours (session-only)
		if (result.token) {
			const cookieStore = await cookies()
			logDebug("[SignIn] Setting auth-token cookie", { token: result.token?.substring(0, 10) + "..." })
			cookieStore.set("auth-token", result.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/", // Ensure cookie is sent with all requests
				maxAge: rememberMe !== false ? 60 * 60 * 24 * 7 : 60 * 60 * 24, // 7 days if remember me, else 24 hours (matches Better Auth)
			})
		}

		// Revalidate session query to trigger refetch (like Better Auth does)
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		// Check if user has an organization
		// This helps with smart redirects after sign-in
		// Note: We use the token we just received, but cookies are also set
		// Backend will use Bearer token (priority) if both are present
		let hasOrganization = false
		try {
			if (result.token) {
				// Use Bearer token for this check (explicit auth)
				const authClient = getAuthenticatedEncoreClient(result.token)
				const orgsResult = await authClient.auth.listOrganizations()
				hasOrganization = (orgsResult.organizations?.length || 0) > 0
			}
		} catch (error) {
			// If check fails, assume no org (safe default)
			console.warn("[SignIn] Failed to check organizations:", error)
			hasOrganization = false
		}

		return {
			success: true,
			user: result.user,
			token: result.token,
			redirect: result.redirect,
			hasOrganization, // Flag to help with redirect logic
		}
	} catch (error: unknown) {
		// Use type-safe error handler
		const errorDetails = getErrorDetails(error)
		console.error("[SignIn] Error caught:", errorDetails)

		// Return consistent error format
		return handleAPIError(error)
	}
}

/**
 * Sign up with email and password
 */
export async function signUpEmail(
	email: string,
	password: string,
	name?: string,
	rememberMe?: boolean
) {
	// Ensure MSW is initialized before making API calls
	if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
		console.log("[SignUp] Initializing MSW before API call...")
		const { initServerMocks } = await import("@/lib/init-mocks-server")
		await initServerMocks()
		// Wait longer to ensure MSW is fully ready and fetch is patched
		await new Promise((resolve) => setTimeout(resolve, 500))

		// Verify fetch is patched
		if (typeof globalThis.fetch === "undefined") {
			console.error("[SignUp] ❌ WARNING: globalThis.fetch is undefined!")
		} else {
			console.log("[SignUp] ✅ globalThis.fetch is available (should be patched)")
		}
	}

	const client = getEncoreClient()
	console.log("[SignUp] Encore client created, making signUpEmail API call...")

	try {
		const result = await client.auth.signUpEmail({
			email,
			password,
			name: name || email.split("@")[0],
			rememberMe,
		})

		// Set auth cookie if token is returned
		// Note: Better Auth also sets "better-auth.session_token" cookie via createSessionCookie()
		// We set "auth-token" cookie to match Better Auth's behavior:
		// - rememberMe = true (or undefined) → 7 days (matches Better Auth's createSessionCookie)
		// - rememberMe = false → 24 hours (session-only)
		if (result.token) {
			const cookieStore = await cookies()
			cookieStore.set("auth-token", result.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: rememberMe !== false ? 60 * 60 * 24 * 7 : 60 * 60 * 24, // 7 days if remember me, else 24 hours (matches Better Auth)
			})
		}

		// Revalidate session query to trigger refetch (like Better Auth does)
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		// Check if user already has an organization
		// New users won't have one, but existing users might
		let hasOrganization = false
		try {
			const orgsResult = await client.auth.listOrganizations()
			hasOrganization = (orgsResult.organizations?.length || 0) > 0
		} catch (error) {
			// If check fails, assume no org (safe default for new users)
			console.warn("[SignUp] Failed to check organizations:", error)
			hasOrganization = false
		}

		return {
			success: true,
			user: result.user,
			token: result.token,
			hasOrganization, // Flag to help with redirect logic
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Sign in with social provider (OAuth)
 */
export async function signInSocial(provider: "google" | "github" | "microsoft") {
	// Mocking disabled - removed MSW initialization
	const client = getEncoreClient()

	try {
		const result = await client.auth.signInSocial({ provider })

		// If redirect URL is returned, redirect to OAuth provider
		if (result.redirect && result.url) {
			redirect(result.url)
		}

		// If token is returned, set cookie
		if (result.token) {
			const cookieStore = await cookies()
			cookieStore.set("auth-token", result.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			})
		}

		// Revalidate session query to trigger refetch (like Better Auth does)
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		return {
			success: true,
			user: result.user,
			token: result.token,
			redirect: result.redirect,
			url: result.url,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Sign out current user
 * Always clears cookies and cache, even if backend call fails
 */
export async function signOut() {
	// Always clear cookie and revalidate, even if backend call fails
	// This ensures user can logout even if backend is having issues
	const cookieStore = await cookies()
	cookieStore.delete("auth-token")
	
	const { revalidatePath } = await import("next/cache")
	revalidatePath("/", "layout")

	try {
		const client = getEncoreClient()
		await client.auth.signOut()
		return { success: true }
	} catch (error: unknown) {
		// Log error but don't fail - we already cleared cookies
		console.error("[SignOut] Backend call failed, but cookies cleared:", error)
		
		// Still return success since we cleared the cookies
		// Frontend will redirect to sign-in page
		return { success: true }
	}
}

/**
 * Get current user session
 * Returns session with user object (Better Auth compatible format)
 */
export async function getSession(): Promise<{
	success: boolean
	session?: auth.SessionResponse & { user?: auth.UserResponse }
	user?: auth.UserResponse
	error?: string
}> {
	// Get auth token from cookie
	const cookieStore = await cookies()
	const token = cookieStore.get("auth-token")?.value

	logDebug("[getSession] Token from cookie:", token ? token.substring(0, 10) + "..." : "null")

	const client = token ? getAuthenticatedEncoreClient(token) : getEncoreClient()

	try {
		const sessionResult = await client.auth.getSession()

		// If no session, return null
		if (!sessionResult.session || !sessionResult.user) {
			return {
				success: true,
				session: undefined,
				user: undefined,
			}
		}

		// Map userID to id for Better Auth compatibility
		const userWithId = {
			...sessionResult.user,
			id: sessionResult.user.id, // UserResponse already has id
		}

		// Return session with user embedded (Better Auth format)
		return {
			success: true,
			session: {
				...sessionResult.session,
				token: token || sessionResult.session?.token || "", // Ensure token is present
				user: userWithId,
			},
			user: userWithId,
		}
	} catch (error: unknown) {
		// If session is invalid, clear the cookie to prevent redirect loops
		// Middleware might see the cookie and redirect to dashboard, but if backend rejects it, we must clear it
		if (token) {
			const cookieStore = await cookies()
			cookieStore.delete("auth-token")
		}

		return handleAPIError(error)
	}
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<{
	success: boolean
	user?: auth.MeResponse
	error?: string
}> {
	// Get auth token from cookie
	const cookieStore = await cookies()
	const token = cookieStore.get("auth-token")?.value

	logDebug("[getCurrentUser] Token from cookie:", token ? token.substring(0, 10) + "..." : "null")

	const client = token ? getAuthenticatedEncoreClient(token) : getEncoreClient()

	try {
		const user = await client.auth.me()
		return {
			success: true,
			user,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Forgot password - Request password reset email
 */
export async function forgotPassword(email: string, redirectTo?: string) {
	const client = getEncoreClient()

	try {
		// Validate redirectTo to prevent open redirects
		const { validateCallbackUrlServer } = await import("@/lib/url-validation")
		const validatedRedirectTo = redirectTo 
			? validateCallbackUrlServer(redirectTo) 
			: undefined

		const result = await client.auth.forgotPassword({ email, redirectTo: validatedRedirectTo || undefined })
		return {
			success: result.success,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Reset password callback - Verify token validity
 */
export async function resetPasswordCallback(token: string) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.resetPasswordCallback(token)
		return {
			success: true,
			valid: result.valid,
			email: result.email,
		}
	} catch (error: unknown) {
		return {
			...handleAPIError(error),
			valid: false,
		}
	}
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.resetPassword({ token, newPassword })

		// Revalidate to trigger session refetch
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		return {
			success: result.success,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Change password (authenticated)
 */
export async function changePassword(
	currentPassword: string,
	newPassword: string,
	revokeOtherSessions?: boolean
) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.changePassword({
			currentPassword,
			newPassword,
			revokeOtherSessions,
		})

		// Revalidate to trigger session refetch
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		return {
			success: result.success,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Change email address
 */
export async function changeEmail(newEmail: string, callbackURL?: string) {
	const client = getEncoreClient()

	try {
		// Validate callbackURL to prevent open redirects
		const { validateCallbackUrlServer } = await import("@/lib/url-validation")
		const validatedCallbackURL = callbackURL 
			? validateCallbackUrlServer(callbackURL) 
			: undefined

		const result = await client.auth.changeEmail({ newEmail, callbackURL: validatedCallbackURL || undefined })

		// Revalidate to trigger session refetch
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		return {
			success: result.status,
			message: result.message,
			user: result.user,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Update user profile
 */
export async function updateProfile(data: { name?: string; image?: string }) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.updateUser(data)

		// Revalidate to trigger session refetch
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")
		revalidatePath("/dashboard/settings")
		revalidatePath("/dashboard/profile")

		return {
			success: result.success,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Delete user account
 */
export async function deleteUser(password?: string, callbackURL?: string) {
	const client = getEncoreClient()

	try {
		// Validate callbackURL to prevent open redirects
		const { validateCallbackUrlServer } = await import("@/lib/url-validation")
		const validatedCallbackURL = callbackURL 
			? validateCallbackUrlServer(callbackURL) 
			: undefined

		const result = await client.auth.deleteUser({ password, callbackURL: validatedCallbackURL || undefined })

		// Clear auth cookie
		const cookieStore = await cookies()
		cookieStore.delete("auth-token")

		// Revalidate to trigger session refetch
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		return {
			success: result.success,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email?: string, callbackURL?: string) {
	const client = getEncoreClient()

	try {
		// Validate callbackURL to prevent open redirects
		const { validateCallbackUrlServer } = await import("@/lib/url-validation")
		const validatedCallbackURL = callbackURL 
			? validateCallbackUrlServer(callbackURL) 
			: undefined

		const result = await client.auth.sendVerificationEmail({
			email: email || "",
			callbackURL: validatedCallbackURL || undefined,
		})

		return {
			success: result.status,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string, callbackURL?: string) {
	const client = getEncoreClient()

	try {
		// Validate callbackURL to prevent open redirects
		const { validateCallbackUrlServer } = await import("@/lib/url-validation")
		const validatedCallbackURL = callbackURL 
			? validateCallbackUrlServer(callbackURL) 
			: undefined

		const result = await client.auth.verifyEmail({ token, callbackURL: validatedCallbackURL || undefined })

		// Revalidate to trigger session refetch
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		return {
			success: result.success,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * List all sessions
 */
export async function listSessions() {
	const client = getEncoreClient()

	try {
		const result = await client.auth.listSessions()
		return {
			success: true,
			sessions: result.sessions || [],
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Revoke a specific session
 */
export async function revokeSession(token: string) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.revokeSession({ token })

		// Revalidate to trigger session refetch
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		return {
			success: result.status,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Revoke all other sessions (keep current)
 */
export async function revokeOtherSessions() {
	const client = getEncoreClient()

	try {
		const result = await client.auth.revokeOtherSessions()

		// Revalidate to trigger session refetch
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		return {
			success: result.status,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * List device sessions
 */
export async function listDeviceSessions() {
	const client = getEncoreClient()

	try {
		const result = await client.auth.listDeviceSessions()
		return {
			success: true,
			sessions: result.sessions || [],
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Set active session
 */
export async function setActiveSession(sessionToken: string) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.setActiveSession({ sessionToken })

		// Set auth cookie if token is returned
		if (result.token) {
			const cookieStore = await cookies()
			cookieStore.set("auth-token", result.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			})
		}

		// Revalidate to trigger session refetch
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		return {
			success: result.success,
			token: result.token,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Enable 2FA
 */
export async function enable2FA(password: string, issuer?: string) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.twoFactorEnable({ password, issuer })
		return {
			success: result.success,
			backupCodes: result.backupCodes,
			totpURI: result.totpURI,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Disable 2FA
 */
export async function disable2FA(password: string) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.twoFactorDisable({ password })

		// Revalidate to trigger session refetch
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		return {
			success: result.success,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Get TOTP URI for 2FA setup
 */
export async function get2FATotpURI(password: string) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.twoFactorGetTotpUri({ password })
		return {
			success: true,
			totpURI: result.totpURI,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Generate backup codes for 2FA
 */
export async function generate2FABackupCodes(password: string) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.twoFactorGenerateBackupCodes({ password })
		return {
			success: true,
			backupCodes: result.backupCodes,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * View backup codes (requires password)
 */
export async function view2FABackupCodes(password: string) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.twoFactorViewBackupCodes({ password })
		return {
			success: true,
			backupCodes: result.backupCodes,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Verify TOTP code during 2FA flow
 */
export async function verify2FATotp(twoFactorToken: string, code: string, trustDevice?: boolean) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.twoFactorVerifyTotp({
			twoFactorToken,
			code,
			trustDevice,
		})

		// Set auth cookie if token is returned
		if (result.token) {
			const cookieStore = await cookies()
			cookieStore.set("auth-token", result.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			})
		}

		// Revalidate to trigger session refetch
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		return {
			success: result.success,
			token: result.token,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Verify OTP for 2FA
 */
export async function verify2FAOtp(twoFactorToken: string, otp: string, trustDevice?: boolean) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.twoFactorVerifyOtp({
			twoFactorToken,
			otp,
			trustDevice,
		})

		// Set auth cookie if token is returned
		if (result.token) {
			const cookieStore = await cookies()
			cookieStore.set("auth-token", result.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			})
		}

		// Revalidate to trigger session refetch
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		return {
			success: result.success,
			token: result.token,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Verify backup code during 2FA flow
 */
export async function verify2FABackupCode(
	twoFactorToken: string,
	code: string,
	trustDevice?: boolean
) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.twoFactorVerifyBackupCode({
			twoFactorToken,
			code,
			trustDevice,
		})

		// Set auth cookie if token is returned
		if (result.token) {
			const cookieStore = await cookies()
			cookieStore.set("auth-token", result.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			})
		}

		// Revalidate to trigger session refetch
		const { revalidatePath } = await import("next/cache")
		revalidatePath("/", "layout")

		return {
			success: result.success,
			token: result.token,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Send OTP for 2FA verification
 */
export async function send2FAOtp(twoFactorToken: string, trustDevice?: boolean) {
	const client = getEncoreClient()

	try {
		const result = await client.auth.twoFactorSendOtp({ twoFactorToken, trustDevice })
		return {
			success: result.success,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}
