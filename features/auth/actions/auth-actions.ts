"use server"

/**
 * Auth Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 */

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { authAction, publicActionClient } from "@/lib/safe-action"
import { getAuthenticatedEncoreClient } from "@/lib/api/server"
import { logDebug, logInfo, logError } from "@/lib/logging/error-logger-simple"
import { validateCallbackUrlServer } from "@/lib/utils/url-validation"
import { EXTERNAL_URLS, LIMITS, AUTH_COOKIE_PRIMARY, AUTH_COOKIE_NAMES } from "@/lib/constants"
import type { auth } from "@/brand-client"

// =============================================================================
// Schemas
// =============================================================================

const signInSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
	rememberMe: z.boolean().optional(),
})

const signUpSchema = z.object({
	email: z.string().email(),
	password: z.string().min(12, "Password must be at least 12 characters"),
	name: z.string().optional(),
	rememberMe: z.boolean().optional(),
})

const socialSignInSchema = z.object({
	provider: z.enum(["google", "github", "microsoft"]),
})

const forgotPasswordSchema = z.object({
	email: z.string().email(),
	redirectTo: z.string().optional(),
})

const resetPasswordCallbackSchema = z.object({
	token: z.string().min(1),
})

const resetPasswordSchema = z.object({
	token: z.string().min(1),
	newPassword: z.string().min(12, "Password must be at least 12 characters"),
})

const changePasswordSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(12, "Password must be at least 12 characters"),
	revokeOtherSessions: z.boolean().optional(),
})

const changeEmailSchema = z.object({
	newEmail: z.string().email(),
	callbackURL: z.string().optional(),
})

const updateProfileSchema = z.object({
	name: z.string().optional(),
	image: z.string().optional(),
})

const deleteUserSchema = z.object({
	password: z.string().optional(),
	callbackURL: z.string().optional(),
})

const sendVerificationSchema = z.object({
	email: z.string().email().optional(),
	callbackURL: z.string().optional(),
})

const verifyEmailSchema = z.object({
	token: z.string().min(1),
	callbackURL: z.string().optional(),
})

const sessionTokenSchema = z.object({
	token: z.string().min(1),
})

const enable2FASchema = z.object({
	password: z.string().min(1),
	issuer: z.string().optional(),
})

const disable2FASchema = z.object({
	password: z.string().min(1),
})

const verify2FATotpSchema = z.object({
	twoFactorToken: z.string().min(1),
	code: z.string().min(1),
	trustDevice: z.boolean().optional(),
})

const verify2FAOtpSchema = z.object({
	twoFactorToken: z.string().min(1),
	otp: z.string().min(1),
	trustDevice: z.boolean().optional(),
})

const verify2FABackupSchema = z.object({
	twoFactorToken: z.string().min(1),
	code: z.string().min(1),
	trustDevice: z.boolean().optional(),
})

const send2FAOtpSchema = z.object({
	twoFactorToken: z.string().min(1),
	trustDevice: z.boolean().optional(),
})

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Helper to set auth cookie
 */
async function setAuthCookie(token: string, rememberMe?: boolean) {
	const cookieStore = await cookies()
	cookieStore.set(AUTH_COOKIE_PRIMARY, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: rememberMe !== false ? 60 * 60 * 24 * 7 : 60 * 60 * 24, // 7 days or 24 hours
	})
}

// =============================================================================
// Public Actions (No Auth Required)
// =============================================================================

/**
 * Sign in with email and password
 */
export const signInEmail = publicActionClient
	.inputSchema(signInSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { email, password, rememberMe } = parsedInput

		logInfo("Calling client.auth.signInEmail", { source: "SignIn" })
		const result = await ctx.client.auth.signInEmail({ email, password, rememberMe })

		logInfo("Sign-in successful", {
			source: "SignIn",
			data: { hasUser: !!result.user, hasToken: !!result.token, redirect: result.redirect },
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
		if (result.token) {
			await setAuthCookie(result.token, rememberMe)
		}

		revalidatePath("/", "layout")

		return {
			success: true,
			user: result.user,
			token: result.token,
			redirect: result.redirect,
		}
	})

/**
 * Sign up with email and password
 */
export const signUpEmail = publicActionClient
	.inputSchema(signUpSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { email, password, name, rememberMe } = parsedInput

		logInfo("Making signUpEmail API call", { source: "SignUp" })

		const result = await ctx.client.auth.signUpEmail({
			email,
			password,
			name: name || email.split("@")[0],
			rememberMe,
		})

		if (result.token) {
			await setAuthCookie(result.token, rememberMe)
		}

		revalidatePath("/", "layout")

		return {
			success: true,
			user: result.user,
			token: result.token,
		}
	})

/**
 * Sign in with social provider (OAuth)
 */
export const signInSocial = publicActionClient
	.inputSchema(socialSignInSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.signInSocial({ provider: parsedInput.provider })

		// If redirect URL is returned, redirect to OAuth provider
		if (result.redirect && result.url) {
			redirect(result.url)
		}

		// If token is returned, set cookie
		if (result.token) {
			await setAuthCookie(result.token, true)
		}

		revalidatePath("/", "layout")

		return {
			success: true,
			user: result.user,
			token: result.token,
			redirect: result.redirect,
			url: result.url,
		}
	})

/**
 * Sign out current user
 */
export const signOut = publicActionClient.inputSchema(z.object({})).action(async ({ ctx }) => {
	// Always clear cookie and revalidate
	const cookieStore = await cookies()
	// SSOT: Clear all auth cookies
	for (const cookieName of AUTH_COOKIE_NAMES) {
		cookieStore.delete(cookieName)
	}

	revalidatePath("/", "layout")

	try {
		await ctx.client.auth.signOut()
		return { success: true }
	} catch (error) {
		logError(error, { source: "SignOut", data: { message: "Backend call failed, but cookies cleared" } })
		return { success: true }
	}
})

/**
 * Get current user session
 */
export const getSession = publicActionClient.inputSchema(z.object({})).action(async ({ ctx }): Promise<{
	session?: auth.SessionResponse & { user?: auth.UserResponse }
	user?: auth.MeResponse | auth.UserResponse
}> => {
	const cookieStore = await cookies()
	const token = cookieStore.get(AUTH_COOKIE_PRIMARY)?.value

	logDebug("[getSession] Token from cookie:", {
		source: "getSession",
		data: { token: token ? `${token.substring(0, 10)}...` : "null" },
	})

	const client = token ? getAuthenticatedEncoreClient(token) : ctx.client

	const sessionResult = await client.auth.getSession()

	if (!sessionResult.session || !sessionResult.user) {
		return { session: undefined, user: undefined }
	}

	return {
		session: {
			...sessionResult.session,
			token: token || sessionResult.session?.token || "",
			user: sessionResult.user,
		},
		user: sessionResult.user,
	}
})

/**
 * Forgot password - Request password reset email
 */
export const forgotPassword = publicActionClient
	.inputSchema(forgotPasswordSchema)
	.action(async ({ parsedInput, ctx }) => {
		const validatedRedirectTo = parsedInput.redirectTo
			? validateCallbackUrlServer(parsedInput.redirectTo)
			: undefined

		const result = await ctx.client.auth.forgotPassword({
			email: parsedInput.email,
			redirectTo: validatedRedirectTo || undefined,
		})

		return { success: result.success }
	})

/**
 * Reset password callback - Verify token validity
 */
export const resetPasswordCallback = publicActionClient
	.inputSchema(resetPasswordCallbackSchema)
	.action(async ({ parsedInput, ctx }) => {
		try {
			const result = await ctx.client.auth.resetPasswordCallback(parsedInput.token)
			return { valid: result.valid, email: result.email }
		} catch {
			return { valid: false }
		}
	})

/**
 * Reset password with token
 */
export const resetPassword = publicActionClient
	.inputSchema(resetPasswordSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.resetPassword({
			token: parsedInput.token,
			newPassword: parsedInput.newPassword,
		})

		revalidatePath("/", "layout")

		return { success: result.success }
	})

/**
 * Verify email with token
 */
export const verifyEmail = publicActionClient
	.inputSchema(verifyEmailSchema)
	.action(async ({ parsedInput, ctx }) => {
		const validatedCallbackURL = parsedInput.callbackURL
			? validateCallbackUrlServer(parsedInput.callbackURL)
			: undefined

		const result = await ctx.client.auth.verifyEmail({
			token: parsedInput.token,
			callbackURL: validatedCallbackURL || undefined,
		})

		revalidatePath("/", "layout")

		return { success: result.success }
	})

/**
 * Verify TOTP code during 2FA flow
 */
export const verify2FATotp = publicActionClient
	.inputSchema(verify2FATotpSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.twoFactorVerifyTotp({
			twoFactorToken: parsedInput.twoFactorToken,
			code: parsedInput.code,
			trustDevice: parsedInput.trustDevice,
		})

		if (result.token) {
			await setAuthCookie(result.token, true)
		}

		revalidatePath("/", "layout")

		return { success: result.success, token: result.token }
	})

/**
 * Verify OTP for 2FA
 */
export const verify2FAOtp = publicActionClient
	.inputSchema(verify2FAOtpSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.twoFactorVerifyOtp({
			twoFactorToken: parsedInput.twoFactorToken,
			otp: parsedInput.otp,
			trustDevice: parsedInput.trustDevice,
		})

		if (result.token) {
			await setAuthCookie(result.token, true)
		}

		revalidatePath("/", "layout")

		return { success: result.success, token: result.token }
	})

/**
 * Verify backup code during 2FA flow
 */
export const verify2FABackupCode = publicActionClient
	.inputSchema(verify2FABackupSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.twoFactorVerifyBackupCode({
			twoFactorToken: parsedInput.twoFactorToken,
			code: parsedInput.code,
			trustDevice: parsedInput.trustDevice,
		})

		if (result.token) {
			await setAuthCookie(result.token, true)
		}

		revalidatePath("/", "layout")

		return { success: result.success, token: result.token }
	})

/**
 * Send OTP for 2FA verification
 */
export const send2FAOtp = publicActionClient
	.inputSchema(send2FAOtpSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.twoFactorSendOtp({
			twoFactorToken: parsedInput.twoFactorToken,
			trustDevice: parsedInput.trustDevice,
		})

		return { success: result.success }
	})

// =============================================================================
// Authenticated Actions
// =============================================================================

/**
 * Get current authenticated user
 */
export const getCurrentUser = authAction.inputSchema(z.object({})).action(async ({ ctx }): Promise<{
	user: {
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
}> => {
	// Use getSession instead of me() - me() no longer exists in API
	const sessionResult = await ctx.client.auth.getSession()
	const user = sessionResult.user

	if (!user) {
		throw new Error("User not authenticated")
	}

	// Map getSession user to expected format
	const normalizedUser = {
		userID: user.id || "",
		id: user.id || "",
		email: user.email || "",
		name: user.name || "",
		image: user.image || undefined,
		emailVerified: user.emailVerified || false,
		role: "user", // Default role
		twoFactorEnabled: false, // Not available in getSession
	}

	return { user: normalizedUser as typeof normalizedUser & { userID: string; email: string; name: string; emailVerified: boolean; role: string; twoFactorEnabled: boolean } }
})

/**
 * Change password (authenticated)
 */
export const changePassword = authAction
	.inputSchema(changePasswordSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.changePassword({
			currentPassword: parsedInput.currentPassword,
			newPassword: parsedInput.newPassword,
			revokeOtherSessions: parsedInput.revokeOtherSessions,
		})

		revalidatePath("/", "layout")

		return { success: result.success }
	})

/**
 * Change email address
 */
export const changeEmail = authAction.inputSchema(changeEmailSchema).action(async ({ parsedInput, ctx }) => {
	const validatedCallbackURL = parsedInput.callbackURL
		? validateCallbackUrlServer(parsedInput.callbackURL)
		: undefined

	const result = await ctx.client.auth.changeEmail({
		newEmail: parsedInput.newEmail,
		callbackURL: validatedCallbackURL || undefined,
	})

	revalidatePath("/", "layout")

	// Standardize success response: use boolean success field
	return { success: !!result.status, message: result.message, user: result.user }
})

/**
 * Update user profile
 */
export const updateProfile = authAction.inputSchema(updateProfileSchema).action(async ({ parsedInput, ctx }) => {
	const result = await ctx.client.auth.updateUser(parsedInput)

	revalidatePath("/", "layout")
	revalidatePath("/dashboard/settings")
	revalidatePath("/dashboard/profile")

	return { success: result.success }
})

/**
 * Delete user account
 */
export const deleteUser = authAction.inputSchema(deleteUserSchema).action(async ({ parsedInput, ctx }) => {
	const validatedCallbackURL = parsedInput.callbackURL
		? validateCallbackUrlServer(parsedInput.callbackURL)
		: undefined

	const result = await ctx.client.auth.deleteUser({
		password: parsedInput.password,
		callbackURL: validatedCallbackURL || undefined,
	})

	// Clear auth cookie
	const cookieStore = await cookies()
	// SSOT: Clear all auth cookies
	for (const cookieName of AUTH_COOKIE_NAMES) {
		cookieStore.delete(cookieName)
	}

	revalidatePath("/", "layout")

	return { success: result.success }
})

/**
 * Send verification email
 */
export const sendVerificationEmail = authAction
	.inputSchema(sendVerificationSchema)
	.action(async ({ parsedInput, ctx }) => {
		const validatedCallbackURL = parsedInput.callbackURL
			? validateCallbackUrlServer(parsedInput.callbackURL)
			: undefined

		const result = await ctx.client.auth.sendVerificationEmail({
			email: parsedInput.email || "",
			callbackURL: validatedCallbackURL || undefined,
		})

		// Standardize success response: use boolean success field
		return { success: !!result.status }
	})

/**
 * List all sessions
 */
export const listSessions = authAction.inputSchema(z.object({})).action(async ({ ctx }) => {
	const result = await ctx.client.auth.listSessions()
	return { sessions: result.sessions || [] }
})

/**
 * Revoke a specific session
 */
export const revokeSession = authAction.inputSchema(sessionTokenSchema).action(async ({ parsedInput, ctx }) => {
	const result = await ctx.client.auth.revokeSession({ token: parsedInput.token })

	revalidatePath("/", "layout")

	// Standardize success response: use boolean success field
	return { success: !!result.status }
})

/**
 * Revoke all other sessions (keep current)
 */
export const revokeOtherSessions = authAction.inputSchema(z.object({})).action(async ({ ctx }) => {
	const result = await ctx.client.auth.revokeOtherSessions()

	revalidatePath("/", "layout")

	// Standardize success response: use boolean success field
	return { success: !!result.status }
})

/**
 * List device sessions
 */
export const listDeviceSessions = authAction.inputSchema(z.object({})).action(async ({ ctx }) => {
	const result = await ctx.client.auth.listDeviceSessions()
	return { sessions: result.sessions || [] }
})

/**
 * Revoke a device session
 */
export const revokeDeviceSession = authAction
	.inputSchema(z.object({ sessionToken: z.string().min(1) }))
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.revokeDeviceSession({ sessionToken: parsedInput.sessionToken })

		revalidatePath("/", "layout")

		return { success: result.success }
	})

/**
 * Set active session
 */
export const setActiveSession = authAction
	.inputSchema(z.object({ sessionToken: z.string().min(1) }))
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.setActiveSession({ sessionToken: parsedInput.sessionToken })

		if (result.token) {
			await setAuthCookie(result.token, true)
		}

		revalidatePath("/", "layout")

		return { success: result.success, token: result.token }
	})

/**
 * Enable 2FA
 */
export const enable2FA = authAction.inputSchema(enable2FASchema).action(async ({ parsedInput, ctx }) => {
	const result = await ctx.client.auth.twoFactorEnable({
		password: parsedInput.password,
		issuer: parsedInput.issuer,
	})

	// Generate QR code URL for easy scanning
	const qrCodeUrl = result.totpURI
		? `${EXTERNAL_URLS.QR_CODE_API}?size=${LIMITS.QR_CODE_SIZE}x${LIMITS.QR_CODE_SIZE}&data=${encodeURIComponent(result.totpURI)}`
		: undefined

	// Extract secret from TOTP URI for manual entry
	const secret = result.totpURI ? result.totpURI.split("secret=")[1]?.split("&")[0] : undefined

	revalidatePath("/dashboard/settings")

	return {
		success: result.success,
		backupCodes: result.backupCodes,
		totpURI: result.totpURI,
		qrCodeUrl,
		secret,
	}
})

/**
 * Disable 2FA
 */
export const disable2FA = authAction.inputSchema(disable2FASchema).action(async ({ parsedInput, ctx }) => {
	const result = await ctx.client.auth.twoFactorDisable({ password: parsedInput.password })

	revalidatePath("/", "layout")

	return { success: result.success }
})

/**
 * Get TOTP URI for 2FA setup
 */
export const get2FATotpURI = authAction
	.inputSchema(z.object({ password: z.string().min(1) }))
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.twoFactorGetTotpUri({ password: parsedInput.password })
		return { totpURI: result.totpURI }
	})

/**
 * Generate backup codes for 2FA
 */
export const generate2FABackupCodes = authAction
	.inputSchema(z.object({ password: z.string().min(1) }))
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.twoFactorGenerateBackupCodes({ password: parsedInput.password })
		return { backupCodes: result.backupCodes }
	})

/**
 * View backup codes (requires password)
 */
export const view2FABackupCodes = authAction
	.inputSchema(z.object({ password: z.string().min(1) }))
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.twoFactorViewBackupCodes({ password: parsedInput.password })
		return { backupCodes: result.backupCodes }
	})

/**
 * List linked accounts (social providers)
 */
export const listLinkedAccounts = authAction.inputSchema(z.object({})).action(async ({ ctx }) => {
	const result = await ctx.client.auth.listAccounts()
	return { accounts: result.accounts || [] }
})

/**
 * Unlink a social account
 */
export const unlinkAccount = authAction
	.inputSchema(z.object({ providerId: z.string().min(1), accountId: z.string().optional() }))
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.unlinkAccount({
			providerId: parsedInput.providerId,
			accountId: parsedInput.accountId,
		})

		revalidatePath("/", "layout")

		// Standardize success response: use boolean success field
		return { success: !!result.status }
	})

/**
 * Leave an organization
 */
export const leaveOrganization = authAction
	.inputSchema(z.object({ organizationId: z.string().min(1) }))
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.leaveOrganization(parsedInput.organizationId)

		revalidatePath("/", "layout")

		return { success: result.success }
	})
