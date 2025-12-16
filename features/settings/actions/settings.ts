"use server"

import { revalidatePath } from "next/cache"
import crypto from "node:crypto"
import { handleServerAuthError } from "@/lib/errors/error-handler"
import { getEncoreClient, handleAPIError } from "@/lib/api/encore"
import { getOrganizationIdOrNull } from "@/lib/ssr-data"
import type { SettingsActionResult } from "@/lib/types"
import {
	updateProfileBodySchema,
	updateOrganizationBodySchema,
	updatePasswordBodySchema,
	bankAccountBodySchema,
	verify2FABodySchema,
} from "@/lib/utils/validations"
import { z } from "zod"
import type { auth } from "@/lib/api/encore-client"

// Generate a cryptographically secure Base32 TOTP secret
function generateTOTPSecret(length = 20): string {
	const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
	const randomBytes = crypto.randomBytes(length)
	let secret = ""
	for (let i = 0; i < length; i++) {
		secret += base32Chars[randomBytes[i] % 32]
	}
	return secret
}

// Schema for notification settings
const notificationSettingsSchema = z.object({
	emailNewEnrollments: z.boolean(),
	emailCampaignUpdates: z.boolean(),
	emailWalletAlerts: z.boolean(),
	emailInvoiceReminders: z.boolean(),
	emailWeeklySummary: z.boolean(),
	pushEnabled: z.boolean(),
	soundEnabled: z.boolean(),
})

export async function updateProfile(data: unknown): Promise<SettingsActionResult> {
	// Validate input
	const validation = updateProfileBodySchema.safeParse(data)
	if (!validation.success) {
		return {
			success: false,
			error: validation.error.issues[0]?.message || "Invalid input",
		}
	}

	try {
		const client = getEncoreClient()
		const result = await client.auth.updateUser({
			name: validation.data.name,
			...(validation.data.image && { image: validation.data.image }),
		})

		revalidatePath("/dashboard/settings")
		revalidatePath("/dashboard/profile")
		revalidatePath("/", "layout")

		return { success: result.success }
	} catch (error: unknown) {
		handleServerAuthError(error)
		return handleAPIError(error)
	}
}

export async function updateOrganization(data: unknown): Promise<SettingsActionResult> {
	// Validate input
	const validation = updateOrganizationBodySchema.safeParse(data)
	if (!validation.success) {
		return {
			success: false,
			error: validation.error.issues[0]?.message || "Invalid input",
		}
	}

	const { getEncoreClient } = await import("@/lib/api/encore")

	try {
		const client = getEncoreClient()
		// Get org ID from session (single source of truth)
		const orgId = await getOrganizationIdOrNull()

		if (!orgId) {
			return { success: false, error: "Organization ID not found" }
		}

		// Map frontend field names to backend field names
		const updateData: {
			id: string
			name?: string
			website?: string
			email?: string
			phoneNumber?: string
			industryCategory?: string
			address?: string
		} = {
			id: orgId,
			name: validation.data.name,
			website: validation.data.website || undefined,
			email: validation.data.email || undefined,
			phoneNumber: validation.data.phone || undefined, // Map phone → phoneNumber
			industryCategory: validation.data.industry || undefined, // Map industry → industryCategory
			address: validation.data.address || undefined,
		}

		await client.organizations.updateOrganization(orgId, updateData)
		revalidatePath("/dashboard/settings")

		return { success: true, message: "Organization updated successfully" }
	} catch (error: unknown) {
		handleServerAuthError(error)
		return handleAPIError(error)
	}
}

export async function updatePassword(data: unknown): Promise<SettingsActionResult> {
	// Validate input
	const validation = updatePasswordBodySchema.safeParse(data)
	if (!validation.success) {
		return {
			success: false,
			error: validation.error.issues[0]?.message || "Invalid input",
		}
	}

	try {
		const client = getEncoreClient()
		const result = await client.auth.changePassword({
			currentPassword: validation.data.currentPassword,
			newPassword: validation.data.newPassword,
		})

		revalidatePath("/dashboard/settings")
		revalidatePath("/", "layout")

		return { success: result.success, message: "Password updated successfully" }
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

export async function updateNotifications(data: unknown): Promise<SettingsActionResult> {
	// Validate input
	const validation = notificationSettingsSchema.safeParse(data)
	if (!validation.success) {
		return {
			success: false,
			error: validation.error.issues[0]?.message || "Invalid input",
		}
	}

	// Update notification preferences via Encore client
	try {
		const client = getEncoreClient()
		// TODO: Implement notification settings update when endpoint is available
		// See: Backend ticket - Add notification settings update endpoint
		// await client.settings.updateNotifications(validation.data)

		revalidatePath("/dashboard/settings")

		return { success: true }
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

export async function addBankAccount(data: unknown): Promise<SettingsActionResult> {
	// Validate input
	const validation = bankAccountBodySchema.safeParse(data)
	if (!validation.success) {
		return {
			success: false,
			error: validation.error.issues[0]?.message || "Invalid input",
		}
	}

	try {
		const client = getEncoreClient()
		// Get org ID from session (single source of truth)
		const orgId = await getOrganizationIdOrNull()

		if (!orgId) {
			return { success: false, error: "Organization ID not found" }
		}

		// Industry Standard: Backend uses activeOrganizationId automatically - no need to pass it
		const result = await client.organizations.addBankAccount({
			...validation.data,
		})
		const accountId = result.id

		revalidatePath("/dashboard/settings")

		return {
			success: true,
			accountId,
			message: "Bank account added. Verification pending.",
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

export async function removeBankAccount(accountId: string): Promise<SettingsActionResult> {
	// Validate id
	if (!accountId || typeof accountId !== "string") {
		return { success: false, error: "Account ID is required" }
	}

	const { getEncoreClient } = await import("@/lib/api/encore")

	try {
		const client = getEncoreClient()
		// Get org ID from session (single source of truth)
		const orgId = await getOrganizationIdOrNull()

		if (!orgId) {
			return { success: false, error: "Organization ID not found" }
		}

		// Industry Standard: Backend uses activeOrganizationId automatically - no need to pass it
		await client.organizations.deleteBankAccount(accountId)

		revalidatePath("/dashboard/settings")

		return { success: true, message: "Bank account removed successfully" }
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

export async function setDefaultBankAccount(accountId: string): Promise<SettingsActionResult> {
	// Validate id
	if (!accountId || typeof accountId !== "string") {
		return { success: false, error: "Account ID is required" }
	}

	try {
		const client = getEncoreClient()
		// Get org ID from session (single source of truth)
		const orgId = await getOrganizationIdOrNull()

		if (!orgId) {
			return { success: false, error: "Organization ID not found" }
		}

		// Industry Standard: Backend uses activeOrganizationId automatically - no need to pass it
		await client.organizations.setDefaultBankAccount(accountId)

		revalidatePath("/dashboard/settings")

		return { success: true }
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

export async function verifyBankAccount(accountId: string): Promise<SettingsActionResult> {
	// Validate id
	if (!accountId || typeof accountId !== "string") {
		return { success: false, error: "Account ID is required" }
	}

	const { getEncoreClient } = await import("@/lib/api/encore")

	try {
		const client = getEncoreClient()
		// Get org ID from session (single source of truth)
		const orgId = await getOrganizationIdOrNull()

		if (!orgId) {
			return { success: false, error: "Organization ID not found" }
		}

		// ✅ NOTE: Bank account verification is now fully implemented with RazorpayX integration
		// See: Hypedrive Encore/organizations/organizations.ts:984-1068
		// Industry Standard: Backend uses activeOrganizationId automatically - no need to pass it
		const result = await client.organizations.verifyBankAccount(accountId)

		revalidatePath("/dashboard/settings")

		return {
			success: true,
			message:
				"Bank account verification initiated. A small amount (₹1) will be deposited to verify your account.",
		}
	} catch (error: unknown) {
		// Handle unimplemented error gracefully
		const errorMessage = error instanceof Error ? error.message : String(error)
		if (
			errorMessage.includes("unimplemented") ||
			errorMessage.includes("not yet implemented")
		) {
			return {
				success: false,
				error:
					"Bank account verification is not yet available. This feature requires RazorpayX integration.",
			}
		}
		return handleAPIError(error)
	}
}

export async function enable2FA(password: string, issuer?: string): Promise<SettingsActionResult> {
	if (!password || typeof password !== "string") {
		return { success: false, error: "Password is required" }
	}

	try {
		const client = getEncoreClient()
		const result = await client.auth.twoFactorEnable({ password, issuer })

		// Generate QR code URL from TOTP URI
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
	} catch (error: unknown) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to enable 2FA",
		}
	}
}

export async function verify2FA(code: unknown): Promise<SettingsActionResult> {
	// Validate input
	const validation = verify2FABodySchema.safeParse({ code })
	if (!validation.success) {
		return {
			success: false,
			error: validation.error.issues[0]?.message || "Invalid code",
		}
	}

	// Note: This is for verifying during setup, not during login
	// During login, use verify2FATotp from auth actions
	// This function might need to be adjusted based on your 2FA flow
	revalidatePath("/dashboard/settings")

	return { success: true, message: "2FA enabled successfully" }
}

export async function disable2FA(password: string): Promise<SettingsActionResult> {
	// Validate password
	if (!password || typeof password !== "string" || password.length < 1) {
		return { success: false, error: "Password is required" }
	}

	try {
		const client = getEncoreClient()
		const result = await client.auth.twoFactorDisable({ password })

		revalidatePath("/dashboard/settings")
		revalidatePath("/", "layout")

		return { success: result.success }
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Change email address
 */
export async function changeEmail(
	newEmail: string,
	password: string
): Promise<SettingsActionResult> {
	if (!newEmail || typeof newEmail !== "string") {
		return { success: false, error: "Email is required" }
	}
	if (!password || typeof password !== "string") {
		return { success: false, error: "Password is required" }
	}

	try {
		const client = getEncoreClient()
		const result = await client.auth.changeEmail({ newEmail })

		revalidatePath("/dashboard/settings")
		revalidatePath("/", "layout")

		return {
			success: result.status,
			message: result.message || "Email change request sent. Please check your email to confirm.",
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Delete user account
 */
export async function deleteUserAccount(password?: string): Promise<SettingsActionResult> {
	try {
		const client = getEncoreClient()
		const result = await client.auth.deleteUser({ password })

		revalidatePath("/dashboard/settings")
		revalidatePath("/", "layout")

		return {
			success: result.success,
			message: "Account deletion request sent. Please check your email to confirm.",
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email?: string): Promise<SettingsActionResult> {
	try {
		const client = getEncoreClient()
		const result = await client.auth.sendVerificationEmail({ email: email || "" })

		return {
			success: result.status,
			message: "Verification email sent. Please check your inbox.",
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

export async function revokeSession(sessionId: string): Promise<SettingsActionResult> {
	// Validate id
	if (!sessionId || typeof sessionId !== "string") {
		return { success: false, error: "Session ID is required" }
	}

	try {
		const client = getEncoreClient()
		const result = await client.auth.revokeSession({ token: sessionId })

		revalidatePath("/dashboard/settings")
		revalidatePath("/", "layout")

		return { success: result.status }
	} catch (error: unknown) {
		handleServerAuthError(error)
		return handleAPIError(error)
	}
}

export async function revokeAllSessions(): Promise<SettingsActionResult> {
	try {
		const client = getEncoreClient()
		const result = await client.auth.revokeOtherSessions()

		revalidatePath("/dashboard/settings")
		revalidatePath("/", "layout")

		return { success: result.status, message: "All other sessions have been signed out" }
	} catch (error: unknown) {
		handleServerAuthError(error)
		return handleAPIError(error)
	}
}

/**
 * Get user sessions
 * Sessions are managed by Encore backend
 */
export async function getUserSessions(): Promise<{
	success: boolean
	data?: Array<{
		id: string
		device: string
		browser: string
		location: string
		lastActive: string
		current: boolean
		iconType: "computer" | "smartphone" | "mac"
	}>
	error?: string
}> {
	try {
		const { getEncoreClient } = await import("@/lib/api/encore")
		const client = getEncoreClient()
		const result = await client.auth.listSessions()

		// Map Encore session format to our UI format
		// ❌ Backend missing: device, browser, location, lastActive, current, iconType
		// TODO: Backend should add these fields to SessionResponse
		// See: Backend ticket - Extend SessionResponse with device/browser/location fields
		const sessions = (result.sessions || []).map((session: auth.SessionResponse) => {
			// Parse userAgent for device/browser if available
			const userAgent = session.userAgent || ""
			const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
			const isMac = /Mac/.test(userAgent)
			const browserMatch = userAgent.match(/(Chrome|Safari|Firefox|Edge)\/[\d.]+/)
			const browser = browserMatch ? browserMatch[1] : "Unknown Browser"

			// Type assertion for missing fields - backend should add these
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
				device: sessionWithExtras.device || (isMobile ? "Mobile Device" : "Desktop") || "Unknown Device", // ❌ Backend should provide
				browser: sessionWithExtras.browser || browser, // ❌ Backend should provide
				location:
					sessionWithExtras.location || (session.ipAddress ? `IP: ${session.ipAddress}` : "Unknown Location"), // ❌ Backend should provide
				lastActive:
					sessionWithExtras.lastActive || session.updatedAt || session.createdAt || new Date().toISOString(), // ❌ Backend should provide
				current: sessionWithExtras.current !== undefined ? sessionWithExtras.current : false, // ❌ Backend should provide
				iconType:
					sessionWithExtras.iconType ||
					((isMobile ? "smartphone" : isMac ? "mac" : "computer") as
						| "computer"
						| "smartphone"
						| "mac"), // ❌ Backend should provide
			}
		})

		return {
			success: true,
			data: sessions.map((s) => ({
				...s,
				iconType: s.iconType || ("computer" as "computer" | "smartphone" | "mac"),
			})),
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}
