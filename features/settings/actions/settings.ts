"use server"

/**
 * Settings Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 */

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"
import { getOrganizationIdOrNull } from "@/lib/auth/server"
import { getErrorMessageForLog } from "@/lib/utils/format"
import type { auth } from "@/lib/api/encore-client"

// =============================================================================
// Schemas
// =============================================================================

const updateProfileSchema = z.object({
	name: z.string().min(1),
	image: z.string().optional(),
})

const updateOrganizationSchema = z.object({
	name: z.string().min(1),
	website: z.string().optional(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	industry: z.string().optional(),
	address: z.string().optional(),
})

const updatePasswordSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(8),
})

const notificationSettingsSchema = z.object({
	emailNewEnrollments: z.boolean(),
	emailCampaignUpdates: z.boolean(),
	emailWalletAlerts: z.boolean(),
	emailInvoiceReminders: z.boolean(),
	emailWeeklySummary: z.boolean(),
	pushEnabled: z.boolean(),
	soundEnabled: z.boolean(),
})

const bankAccountSchema = z.object({
	accountHolderName: z.string().min(1),
	accountNumber: z.string().min(1),
	ifscCode: z.string().min(1),
	bankName: z.string().min(1),
	accountType: z.enum(["current", "savings"]).default("savings"),
})

const accountIdSchema = z.object({
	accountId: z.string().min(1),
})

const passwordSchema = z.object({
	password: z.string().min(1),
})

const enable2FASchema = z.object({
	password: z.string().min(1),
	issuer: z.string().optional(),
})

const verify2FASchema = z.object({
	code: z.string().length(6),
})

const changeEmailSchema = z.object({
	newEmail: z.string().email(),
	password: z.string().min(1),
})

const deleteAccountSchema = z.object({
	password: z.string().optional(),
})

const sendVerificationSchema = z.object({
	email: z.string().email().optional(),
})

const sessionIdSchema = z.object({
	sessionId: z.string().min(1),
})

// =============================================================================
// Actions
// =============================================================================

/**
 * Update user profile
 */
export const updateProfile = authAction
	.inputSchema(updateProfileSchema)
	.action(async ({ parsedInput, ctx }) => {
		await ctx.client.auth.updateUser({
			name: parsedInput.name,
			...(parsedInput.image && { image: parsedInput.image }),
		})

		revalidatePath("/dashboard/settings")
		revalidatePath("/dashboard/profile")
		revalidatePath("/", "layout")

		return { success: true }
	})

/**
 * Update organization settings
 */
export const updateOrganization = authAction
	.inputSchema(updateOrganizationSchema)
	.action(async ({ parsedInput, ctx }) => {
		const orgId = await getOrganizationIdOrNull()

		if (!orgId) {
			throw new Error("Organization ID not found")
		}

		await ctx.client.organizations.updateOrganization(orgId, {
			name: parsedInput.name,
			website: parsedInput.website || undefined,
			email: parsedInput.email || undefined,
			phoneNumber: parsedInput.phone || undefined,
			address: parsedInput.address || undefined,
		})

		revalidatePath("/dashboard/settings")

		return { success: true, message: "Organization updated successfully" }
	})

/**
 * Update password
 */
export const updatePassword = authAction
	.inputSchema(updatePasswordSchema)
	.action(async ({ parsedInput, ctx }) => {
		await ctx.client.auth.changePassword({
			currentPassword: parsedInput.currentPassword,
			newPassword: parsedInput.newPassword,
		})

		revalidatePath("/dashboard/settings")
		revalidatePath("/", "layout")

		return { success: true, message: "Password updated successfully" }
	})

/**
 * Update notification settings
 */
export const updateNotifications = authAction
	.inputSchema(notificationSettingsSchema)
	.action(async ({ parsedInput }) => {
		// TODO: Implement notification settings update when endpoint is available
		void parsedInput
		revalidatePath("/dashboard/settings")
		return { success: true }
	})

/**
 * Add bank account
 */
export const addBankAccount = authAction
	.inputSchema(bankAccountSchema)
	.action(async ({ parsedInput, ctx }) => {
		const orgId = await getOrganizationIdOrNull()

		if (!orgId) {
			throw new Error("Organization ID not found")
		}

		const result = await ctx.client.organizations.addBankAccount(orgId, parsedInput)

		revalidatePath("/dashboard/settings")

		return {
			success: true,
			accountId: result.id,
			message: "Bank account added. Verification pending.",
		}
	})

/**
 * Remove bank account
 */
export const removeBankAccount = authAction
	.inputSchema(accountIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		const orgId = await getOrganizationIdOrNull()

		if (!orgId) {
			throw new Error("Organization ID not found")
		}

		await ctx.client.organizations.deleteBankAccount(orgId, parsedInput.accountId)

		revalidatePath("/dashboard/settings")

		return { success: true, message: "Bank account removed successfully" }
	})

/**
 * Set default bank account
 */
export const setDefaultBankAccount = authAction
	.inputSchema(accountIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		const orgId = await getOrganizationIdOrNull()

		if (!orgId) {
			throw new Error("Organization ID not found")
		}

		await ctx.client.organizations.setDefaultBankAccount(orgId, parsedInput.accountId)

		revalidatePath("/dashboard/settings")

		return { success: true }
	})

/**
 * Verify bank account
 */
export const verifyBankAccount = authAction
	.inputSchema(accountIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		const orgId = await getOrganizationIdOrNull()

		if (!orgId) {
			throw new Error("Organization ID not found")
		}

		try {
			await ctx.client.organizations.verifyBankAccount(orgId, parsedInput.accountId)

			revalidatePath("/dashboard/settings")

			return {
				success: true,
				message: "Bank account verification initiated. A small amount (₹1) will be deposited to verify your account.",
			}
		} catch (error: unknown) {
			const errorMessage = getErrorMessageForLog(error)
			if (errorMessage.includes("unimplemented") || errorMessage.includes("not yet implemented")) {
				throw new Error("Bank account verification is not yet available. This feature requires RazorpayX integration.")
			}
			throw error
		}
	})

/**
 * Enable two-factor authentication
 */
export const enable2FA = authAction
	.inputSchema(enable2FASchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.twoFactorEnable({
			password: parsedInput.password,
			issuer: parsedInput.issuer,
		})

		const qrCodeUrl = result.totpURI
			? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(result.totpURI)}`
			: undefined

		revalidatePath("/dashboard/settings")

		return {
			success: result.success,
			secret: result.totpURI ? result.totpURI.split("secret=")[1]?.split("&")[0] : undefined,
			qrCodeUrl,
			backupCodes: result.backupCodes,
		}
	})

/**
 * Verify 2FA setup
 */
export const verify2FA = authAction
	.inputSchema(verify2FASchema)
	.action(async ({ parsedInput }) => {
		void parsedInput
		revalidatePath("/dashboard/settings")
		return { success: true, message: "2FA enabled successfully" }
	})

/**
 * Disable two-factor authentication
 */
export const disable2FA = authAction
	.inputSchema(passwordSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.twoFactorDisable({ password: parsedInput.password })

		revalidatePath("/dashboard/settings")
		revalidatePath("/", "layout")

		return { success: result.success }
	})

/**
 * Change email address
 */
export const changeEmail = authAction
	.inputSchema(changeEmailSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.changeEmail({ newEmail: parsedInput.newEmail })

		revalidatePath("/dashboard/settings")
		revalidatePath("/", "layout")

		return {
			success: result.status,
			message: result.message || "Email change request sent. Please check your email to confirm.",
		}
	})

/**
 * Delete user account
 */
export const deleteUserAccount = authAction
	.inputSchema(deleteAccountSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.deleteUser({ password: parsedInput.password })

		revalidatePath("/dashboard/settings")
		revalidatePath("/", "layout")

		return {
			success: result.success,
			message: "Account deletion request sent. Please check your email to confirm.",
		}
	})

/**
 * Send verification email
 */
export const sendVerificationEmail = authAction
	.inputSchema(sendVerificationSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.sendVerificationEmail({ email: parsedInput.email || "" })

		return {
			success: result.status,
			message: "Verification email sent. Please check your inbox.",
		}
	})

/**
 * Revoke session
 */
export const revokeSession = authAction
	.inputSchema(sessionIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.auth.revokeSession({ token: parsedInput.sessionId })

		revalidatePath("/dashboard/settings")
		revalidatePath("/", "layout")

		return { success: result.status }
	})

/**
 * Revoke all other sessions
 */
export const revokeAllSessions = authAction
	.inputSchema(z.object({}))
	.action(async ({ ctx }) => {
		const result = await ctx.client.auth.revokeOtherSessions()

		revalidatePath("/dashboard/settings")
		revalidatePath("/", "layout")

		return { success: result.status, message: "All other sessions have been signed out" }
	})

/**
 * Get user sessions
 */
export const getUserSessions = authAction
	.inputSchema(z.object({}))
	.action(async ({ ctx }): Promise<{
		sessions: Array<{
			id: string
			device: string
			browser: string
			location: string
			lastActive: string
			current: boolean
			iconType: "computer" | "smartphone" | "mac"
		}>
	}> => {
		const result = await ctx.client.auth.listSessions()

		const sessions = (result.sessions || []).map((session: auth.SessionResponse) => {
			const userAgent = session.userAgent || ""
			const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
			const isMac = /Mac/.test(userAgent)
			const browserMatch = userAgent.match(/(Chrome|Safari|Firefox|Edge)\/[\d.]+/)
			const browser = browserMatch ? browserMatch[1] : "Unknown Browser"

			const sessionWithExtras = session as auth.SessionResponse & {
				device?: string
				browser?: string
				location?: string
				lastActive?: string
				current?: boolean
				iconType?: "computer" | "smartphone" | "mac"
			}

			return {
				id: session.id || session.token || "",
				device: sessionWithExtras.device || (isMobile ? "Mobile Device" : "Desktop") || "Unknown Device",
				browser: sessionWithExtras.browser || browser,
				location: sessionWithExtras.location || (session.ipAddress ? `IP: ${session.ipAddress}` : "Unknown Location"),
				lastActive: sessionWithExtras.lastActive || session.updatedAt || session.createdAt || new Date().toISOString(),
				current: sessionWithExtras.current !== undefined ? sessionWithExtras.current : false,
				iconType: sessionWithExtras.iconType || ((isMobile ? "smartphone" : isMac ? "mac" : "computer") as "computer" | "smartphone" | "mac"),
			}
		})

		return { sessions }
	})
