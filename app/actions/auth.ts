"use server"

// Mocking disabled - removed MSW initialization

import { getEncoreClient, getAuthenticatedEncoreClient, handleAPIError, getErrorDetails } from "@/lib/encore"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import type { auth } from "@/lib/encore-client"
import { logDebug } from "@/lib/debug"
import { revalidatePath } from "next/cache"

/**
 * Helper function to ensure user has an active organization set
 * Prefers approved organizations over draft/pending ones
 * Returns true if active org was set or already exists, false otherwise
 */
async function ensureActiveOrganization(token: string): Promise<{
	success: boolean
	hasOrganization: boolean
	activeOrgSet: boolean
}> {
	try {
		const authClient = getAuthenticatedEncoreClient(token)
		
		// Get current user to check activeOrganizationId
		const meResult = await authClient.auth.me()
		const hasActiveOrg = !!meResult.activeOrganizationId
		
		// If user already has active org, no need to set
		if (hasActiveOrg) {
			return {
				success: true,
				hasOrganization: true,
				activeOrgSet: true,
			}
		}
		
		// Get user's organizations
		const orgsResult = await authClient.auth.listOrganizations()
		const organizations = orgsResult.organizations || []
		
		if (organizations.length === 0) {
			return {
				success: true,
				hasOrganization: false,
				activeOrgSet: false,
			}
		}
		
		// ✅ FIX: Prefer approved organizations over draft/pending
		// Try to get full organization details to check approval status
		// We'll try to get details for the first few orgs to find an approved one
		let orgToSet = organizations[0]
		
		// Try to find an approved organization (check up to 3 orgs for performance)
		for (let i = 0; i < Math.min(organizations.length, 3); i++) {
			try {
				const fullOrg = await authClient.organizations.getOrganization(organizations[i].id)
				// Prefer approved organizations
				if (fullOrg.approvalStatus === "approved") {
					orgToSet = organizations[i]
					break
				}
			} catch (error) {
				// If we can't get details, continue with next org
				logDebug("[ensureActiveOrganization] Failed to get org details", {
					orgId: organizations[i].id,
					error: error instanceof Error ? error.message : String(error),
				})
			}
		}
		
		// Set the first organization as active
		await authClient.auth.setActiveOrganization({
			organizationId: orgToSet.id,
		})
		
		// Revalidate session to refresh with new active org
		revalidatePath("/", "layout")
		
		logDebug("[ensureActiveOrganization] Set active organization", {
			organizationId: orgToSet.id,
			organizationName: orgToSet.name,
		})
		
		return {
			success: true,
			hasOrganization: true,
			activeOrgSet: true,
		}
	} catch (error) {
		// Log error but don't fail - user can set manually later
		logDebug("[ensureActiveOrganization] Failed to set active organization", {
			error: error instanceof Error ? error.message : String(error),
		})
		
		// Still return success with hasOrganization if we can determine it
		try {
			const authClient = getAuthenticatedEncoreClient(token)
			const orgsResult = await authClient.auth.listOrganizations()
			return {
				success: true,
				hasOrganization: (orgsResult.organizations?.length || 0) > 0,
				activeOrgSet: false,
			}
		} catch {
			return {
				success: false,
				hasOrganization: false,
				activeOrgSet: false,
			}
		}
	}
}

/**
 * Sign in with email and password
 */
export async function signInEmail(email: string, password: string, rememberMe?: boolean) {
	// Mocking disabled - removed MSW initialization
	
	const client = getEncoreClient()

	try {
		const { logInfo } = await import("@/lib/error-logger-simple")
		logInfo("Calling client.auth.signInEmail", { source: "SignIn" })
		const result = await client.auth.signInEmail({ email, password, rememberMe })
		logInfo("Sign-in successful", { 
			source: "SignIn",
			data: {
				hasUser: !!result.user,
				hasToken: !!result.token,
				redirect: result.redirect
			}
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
		revalidatePath("/", "layout")

		// ✅ FIX: Ensure active organization is set after login
		// This fixes the issue where users have orgs but no active org
		let hasOrganization = false
		let activeOrgSet = false
		if (result.token) {
			try {
				const orgResult = await ensureActiveOrganization(result.token)
				hasOrganization = orgResult.hasOrganization
				activeOrgSet = orgResult.activeOrgSet
				
				// Revalidate again after setting active org to ensure session is fresh
				if (activeOrgSet) {
					revalidatePath("/", "layout")
				}
			} catch (error) {
				// If check fails, assume no org (safe default)
				logDebug("[SignIn] Failed to ensure active organization:", error)
				hasOrganization = false
				activeOrgSet = false
			}
		}

		return {
			success: true,
			user: result.user,
			token: result.token,
			redirect: result.redirect,
			hasOrganization, // Flag to help with redirect logic
			activeOrgSet, // Flag to indicate if active org was set
		}
	} catch (error: unknown) {
		const { logError } = await import("@/lib/error-logger-simple")
		logError(error, { source: "SignIn", data: { email } })

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
		const { logInfo, logWarn } = await import("@/lib/error-logger-simple")
		logInfo("Initializing MSW before API call", { source: "SignUp" })
		const { initServerMocks } = await import("@/lib/init-mocks-server")
		await initServerMocks()
		// Wait longer to ensure MSW is fully ready and fetch is patched
		await new Promise((resolve) => setTimeout(resolve, 500))

		// Verify fetch is patched
		if (typeof globalThis.fetch === "undefined") {
			logWarn("globalThis.fetch is undefined", { source: "SignUp" })
		} else {
			logInfo("globalThis.fetch is available (should be patched)", { source: "SignUp" })
		}
	}

	const client = getEncoreClient()
	const { logInfo } = await import("@/lib/error-logger-simple")
	logInfo("Encore client created, making signUpEmail API call", { source: "SignUp" })

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
		revalidatePath("/", "layout")

		// ✅ FIX: Ensure active organization is set after signup
		// This fixes the issue where existing users sign up again and have orgs but no active org
		let hasOrganization = false
		let activeOrgSet = false
		if (result.token) {
			try {
				const orgResult = await ensureActiveOrganization(result.token)
				hasOrganization = orgResult.hasOrganization
				activeOrgSet = orgResult.activeOrgSet
				
				// Revalidate again after setting active org to ensure session is fresh
				if (activeOrgSet) {
					revalidatePath("/", "layout")
				}
			} catch (error) {
				// If check fails, assume no org (safe default for new users)
				logDebug("[SignUp] Failed to ensure active organization:", error)
				hasOrganization = false
				activeOrgSet = false
			}
		}

		// Clear any previous user's onboarding draft data on signup
		try {
			// Note: localStorage is client-side only, but we clear it here as a safety measure
			// The actual clearing happens in the client component after redirect
		} catch (e) {
			// Ignore errors
		}

		return {
			success: true,
			user: result.user,
			token: result.token,
			hasOrganization, // Flag to help with redirect logic
			activeOrgSet, // Flag to indicate if active org was set
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
		const { logError } = await import("@/lib/error-logger-simple")
		logError(error, { source: "SignOut", data: { message: "Backend call failed, but cookies cleared" } })
		
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
 * Get current authenticated user
 * Uses the /auth/me endpoint which returns MeResponse with userID field
 */
export async function getCurrentUser(): Promise<{
	success: boolean
	user?: {
		userID: string
		email: string
		name: string
		image?: string
		emailVerified: boolean
		role: string
		activeOrganizationId?: string
		organizationRole?: string
		organizationIds?: string[]
		shopperId?: string
		adminId?: string
		isImpersonating?: boolean
		impersonatedBy?: string
		phone?: string
		twoFactorEnabled: boolean
	}
	error?: string
}> {
	// Get auth token from cookie
	const cookieStore = await cookies()
	const token = cookieStore.get("auth-token")?.value

	if (!token) {
		return {
			success: true,
			user: undefined,
		}
	}

	const client = getAuthenticatedEncoreClient(token)

	try {
		const userResult = await client.auth.me()
		return {
			success: true,
			user: userResult,
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

/**
 * Ensure active organization is set after OAuth login
 * This is called from the OAuth callback page to set active org
 */
export async function ensureActiveOrgAfterOAuth(): Promise<{
	success: boolean
	hasOrganization: boolean
	activeOrgSet: boolean
}> {
	const cookieStore = await cookies()
	const token = cookieStore.get("auth-token")?.value

	if (!token) {
		return {
			success: false,
			hasOrganization: false,
			activeOrgSet: false,
		}
	}

	return await ensureActiveOrganization(token)
}
