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
import { getAuthenticatedEncoreClient } from "@/lib/api/encore"
import { logDebug, logInfo, logError } from "@/lib/logging/error-logger-simple"
import { validateCallbackUrlServer } from "@/lib/utils/url-validation"
import { getErrorMessageForLog } from "@/lib/utils/format"
import type { auth } from "@/lib/api/encore-client"

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
	password: z.string().min(8),
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
	newPassword: z.string().min(8),
})

const changePasswordSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(8),
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
 * Helper function to ensure user has an active organization set
 * Prefers approved organizations over draft/pending ones
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
			return { success: true, hasOrganization: true, activeOrgSet: true }
		}

		// Get user's organizations
		const orgsResult = await authClient.auth.listOrganizations()
		const organizations = orgsResult.organizations || []

		if (organizations.length === 0) {
			return { success: true, hasOrganization: false, activeOrgSet: false }
		}

		// Prefer approved organizations
		let orgToSet = organizations[0]

		const orgsWithStatus = organizations.filter(
			(org): org is typeof org & { approvalStatus: string } =>
				"approvalStatus" in org && typeof (org as { approvalStatus?: string }).approvalStatus === "string"
		)

		if (orgsWithStatus.length > 0) {
			const approvedOrg = orgsWithStatus.find((org) => org.approvalStatus === "approved")
			if (approvedOrg) {
				orgToSet = approvedOrg
			}
		} else {
			// Fallback: check up to 2 orgs for performance
			for (let i = 0; i < Math.min(organizations.length, 2); i++) {
				try {
					const fullOrg = await authClient.organizations.getOrganization(organizations[i].id)
					if (fullOrg.approvalStatus === "approved") {
						orgToSet = organizations[i]
						break
					}
				} catch (error) {
					logDebug("[ensureActiveOrganization] Failed to get org details", {
						source: "ensureActiveOrganization",
						data: { orgId: organizations[i].id, error: getErrorMessageForLog(error) },
					})
				}
			}
		}

		// Set the organization as active
		await authClient.auth.setActiveOrganization({ organizationId: orgToSet.id })

		revalidatePath("/", "layout")

		logDebug("[ensureActiveOrganization] Set active organization", {
			source: "ensureActiveOrganization",
			data: { organizationId: orgToSet.id, organizationName: orgToSet.name },
		})

		return { success: true, hasOrganization: true, activeOrgSet: true }
	} catch (error) {
		logDebug("[ensureActiveOrganization] Failed to set active organization", {
			source: "ensureActiveOrganization",
			data: { error: getErrorMessageForLog(error) },
		})

		return { success: false, hasOrganization: false, activeOrgSet: false }
	}
}

/**
 * Helper to set auth cookie
 */
async function setAuthCookie(token: string, rememberMe?: boolean) {
	const cookieStore = await cookies()
	cookieStore.set("auth-token", token, {
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

		// Ensure active organization is set after login
		let hasOrganization = false
		let activeOrgSet = false
		if (result.token) {
			try {
				const orgResult = await ensureActiveOrganization(result.token)
				hasOrganization = orgResult.hasOrganization
				activeOrgSet = orgResult.activeOrgSet

				if (activeOrgSet) {
					revalidatePath("/", "layout")
				}
			} catch (error) {
				logDebug("[SignIn] Failed to ensure active organization:", { source: "SignIn", data: { error } })
			}
		}

		return {
			success: true,
			user: result.user,
			token: result.token,
			redirect: result.redirect,
			hasOrganization,
			activeOrgSet,
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

		// Ensure active organization is set after signup
		let hasOrganization = false
		let activeOrgSet = false
		if (result.token) {
			try {
				const orgResult = await ensureActiveOrganization(result.token)
				hasOrganization = orgResult.hasOrganization
				activeOrgSet = orgResult.activeOrgSet

				if (activeOrgSet) {
					revalidatePath("/", "layout")
				}
			} catch (error) {
				logDebug("[SignUp] Failed to ensure active organization:", { source: "SignUp", data: { error } })
			}
		}

		return {
			success: true,
			user: result.user,
			token: result.token,
			hasOrganization,
			activeOrgSet,
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
	cookieStore.delete("auth-token")

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
	const token = cookieStore.get("auth-token")?.value

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
	const userResult = await ctx.client.auth.me()

	const normalizedUser = {
		...userResult,
		userID: (userResult as unknown as { userID?: string; id?: string }).userID || (userResult as unknown as { userID?: string; id?: string }).id || "",
		id: (userResult as unknown as { userID?: string; id?: string }).id || (userResult as unknown as { userID?: string; id?: string }).userID || "",
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

	return { success: result.status, message: result.message, user: result.user }
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
	cookieStore.delete("auth-token")

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

		return { success: result.status }
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

	return { success: result.status }
})

/**
 * Revoke all other sessions (keep current)
 */
export const revokeOtherSessions = authAction.inputSchema(z.object({})).action(async ({ ctx }) => {
	const result = await ctx.client.auth.revokeOtherSessions()

	revalidatePath("/", "layout")

	return { success: result.status }
})

/**
 * List device sessions
 */
export const listDeviceSessions = authAction.inputSchema(z.object({})).action(async ({ ctx }) => {
	const result = await ctx.client.auth.listDeviceSessions()
	return { sessions: result.sessions || [] }
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

	return {
		success: result.success,
		backupCodes: result.backupCodes,
		totpURI: result.totpURI,
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
 * Ensure active organization is set after OAuth login
 */
export const ensureActiveOrgAfterOAuth = authAction.inputSchema(z.object({})).action(async ({ ctx }) => {
	return await ensureActiveOrganization(ctx.token)
})
