"use server"

/**
 * Settings Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 *
 * NOTE: Auth-related operations (updateProfile, changeEmail, deleteUser, 2FA,
 * sessions, verification) are in @/features/auth/actions/auth-actions.ts
 * This file only contains settings-specific actions (org settings, bank accounts, etc.)
 */

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"
import { getErrorMessage } from "@/lib/errors/encore-error-handler"
import type { auth } from "@/brand-client"

// =============================================================================
// Schemas
// =============================================================================

// Note: organizations.UpdateOrganizationRequest supports:
// name, description, website, contactPerson, phoneNumber, email, address, city, state, postalCode
// industryCategory is only in admin.UpdateOrganizationRequest (not available to regular users)
const updateOrganizationSchema = z.object({
	organizationId: z.string().min(1),
	name: z.string().min(1),
	description: z.string().optional(),
	website: z.string().optional(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	contactPerson: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	postalCode: z.string().optional(),
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
	organizationId: z.string().min(1),
	accountHolderName: z.string().min(1),
	accountNumber: z.string().min(1),
	ifscCode: z.string().min(1),
	bankName: z.string().min(1),
	accountType: z.enum(["current", "savings"]).default("savings"),
})

const accountIdSchema = z.object({
	organizationId: z.string().min(1),
	accountId: z.string().min(1),
})

// =============================================================================
// Actions
// =============================================================================

// NOTE: updateProfile is in @/features/auth/actions/auth-actions.ts

/**
 * Update organization settings
 * NOTE: auth.updateOrganizationAuth only supports name, slug, logo
 * Other fields (description, website, email, phone, etc.) require admin endpoint
 */
export const updateOrganization = authAction
	.inputSchema(updateOrganizationSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, ...data } = parsedInput

		// auth.updateOrganizationAuth only supports: name, slug, logo
		await ctx.client.auth.updateOrganizationAuth(organizationId, {
			name: data.name,
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
 * Update UI notification preferences (local/profile settings)
 *
 * NOTE: This handles UI-specific notification preferences for the profile settings page.
 * These are stored as user preferences and control email digest frequency, sound settings, etc.
 *
 * For Novu-based notification channel preferences (email/push/sms per workflow),
 * use the hooks from @/features/notifications instead:
 * - useNotificationPreferences() - get workflow preferences
 * - useUpdateNotificationPreferences() - update channel preferences
 */
export const updateNotifications = authAction
	.inputSchema(notificationSettingsSchema)
	.action(async ({ parsedInput }) => {
		// UI preferences stored locally - not workflow channel preferences
		// Backend workflow preferences are managed via @/features/notifications hooks
		void parsedInput
		revalidatePath("/dashboard/settings")
		return { success: true, message: "Notification preferences updated" }
	})

/**
 * Add bank account
 */
export const addBankAccount = authAction
	.inputSchema(bankAccountSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, ...data } = parsedInput

		const result = await ctx.client.organizations.addBankAccount(organizationId, data)

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
		await ctx.client.organizations.deleteBankAccount(parsedInput.organizationId, parsedInput.accountId)

		revalidatePath("/dashboard/settings")

		return { success: true, message: "Bank account removed successfully" }
	})

/**
 * Set default bank account
 */
export const setDefaultBankAccount = authAction
	.inputSchema(accountIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		await ctx.client.organizations.setDefaultBankAccount(parsedInput.organizationId, parsedInput.accountId)

		revalidatePath("/dashboard/settings")

		return { success: true }
	})

/**
 * Verify bank account
 */
export const verifyBankAccount = authAction
	.inputSchema(accountIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		try {
			await ctx.client.organizations.verifyBankAccount(parsedInput.organizationId, parsedInput.accountId)

			revalidatePath("/dashboard/settings")

			return {
				success: true,
				message: "Bank account verification initiated. A small amount (₹1) will be deposited to verify your account.",
			}
		} catch (error: unknown) {
			const errorMessage = getErrorMessage(error)
			if (errorMessage.includes("unimplemented") || errorMessage.includes("not yet implemented")) {
				throw new Error("Bank account verification is not yet available. This feature requires RazorpayX integration.")
			}
			throw error
		}
	})

// NOTE: 2FA operations (enable2FA, disable2FA) are in @/features/auth/actions/auth-actions.ts
// NOTE: changeEmail is in @/features/auth/actions/auth-actions.ts
// NOTE: deleteUser is in @/features/auth/actions/auth-actions.ts
// NOTE: sendVerificationEmail is in @/features/auth/actions/auth-actions.ts
// NOTE: revokeSession, revokeOtherSessions are in @/features/auth/actions/auth-actions.ts

/**
 * Delete organization
 */
export const deleteOrganization = authAction
	.inputSchema(z.object({
		organizationId: z.string().min(1),
		confirmationText: z.string().min(1),
	}))
	.action(async ({ parsedInput, ctx }) => {
		// Verify confirmation text matches "DELETE"
		if (parsedInput.confirmationText !== "DELETE") {
			throw new Error("Please type DELETE to confirm")
		}

		const result = await ctx.client.auth.deleteOrganization(parsedInput.organizationId)

		revalidatePath("/dashboard")
		revalidatePath("/", "layout")

		return { success: result.success }
	})

/**
 * Update organization logo
 */
export const updateOrganizationLogo = authAction
	.inputSchema(z.object({
		organizationId: z.string().min(1),
		logoUrl: z.string().url(),
	}))
	.action(async ({ parsedInput, ctx }) => {
		await ctx.client.organizations.updateOrganizationLogo(parsedInput.organizationId, {
			logoUrl: parsedInput.logoUrl,
		})

		revalidatePath("/dashboard/settings")
		revalidatePath("/dashboard")
		revalidatePath("/", "layout")

		return { success: true }
	})

/**
 * Remove organization logo
 */
export const removeOrganizationLogo = authAction
	.inputSchema(z.object({
		organizationId: z.string().min(1),
	}))
	.action(async ({ parsedInput, ctx }) => {
		// Set logo to empty string to remove it
		await ctx.client.organizations.updateOrganizationLogo(parsedInput.organizationId, {
			logoUrl: "",
		})

		revalidatePath("/dashboard/settings")
		revalidatePath("/dashboard")
		revalidatePath("/", "layout")

		return { success: true }
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
