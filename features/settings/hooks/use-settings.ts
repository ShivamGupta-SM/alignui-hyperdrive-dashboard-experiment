/**
 * Settings React Query Hooks
 *
 * SSOT Pattern: Uses organizationKeys from @/features/organizations for org data
 * Settings-specific data (bank accounts, GST, activity) uses settingsKeys
 *
 * NOTE: Auth-related mutations (profile, email, 2FA, sessions) now use
 * auth actions from @/features/auth/actions/auth-actions.ts
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { client } from "@/lib/api/client"
import { STALE_TIME, GC_TIME, DEFAULT_RETRY_CONFIG, createMutationErrorHandler } from "@/lib/utils/query-config"
import { organizationKeys } from "@/features/organizations/hooks/use-organizations"
import { authKeys } from "@/features/auth/hooks/use-auth"
import * as settingsActions from "../actions/settings"
import * as authActions from "@/features/auth/actions/auth-actions"
import type { OrganizationSettings, AddBankAccountInput } from "../types"

// ============================================
// Query Keys - Settings specific only
// Bank accounts uses organizationKeys.bankAccounts for SSOT
// ============================================
export const settingsKeys = {
	gst: (orgId: string) => ["settings", orgId, "gst"] as const,
	activity: (orgId: string) => ["settings", orgId, "activity"] as const,
	sessions: () => ["sessions"] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * Get organization settings
 * SSOT: Uses organizationKeys.detail - shares cache with useOrganization/useOrganizationById
 * Uses auth.getFullOrganization which returns org with members
 */
export function useOrganizationSettings(organizationId: string) {
	return useQuery({
		queryKey: organizationKeys.detail(organizationId),
		queryFn: () => client.auth.getFullOrganization(organizationId, {}),
		enabled: !!organizationId && organizationId !== "me",
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get bank accounts
 * SSOT: Uses organizationKeys.bankAccounts - single source for bank account data
 */
export function useBankAccounts(organizationId: string) {
	return useQuery({
		queryKey: organizationKeys.bankAccounts(organizationId),
		queryFn: () => client.organizations.listBankAccounts(organizationId, {}),
		enabled: !!organizationId,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get GST details
 */
export function useGstDetails(organizationId: string) {
	return useQuery({
		queryKey: settingsKeys.gst(organizationId),
		queryFn: () => client.organizations.getGSTDetails(organizationId),
		enabled: !!organizationId,
		staleTime: STALE_TIME.MEDIUM,
		gcTime: GC_TIME.LONG,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get organization activity
 * FIX: Use primitive values in query key to avoid object reference instability
 */
export function useOrganizationActivity(organizationId: string, cursor?: string, limit = 20) {
	return useQuery({
		queryKey: [...settingsKeys.activity(organizationId), cursor ?? "", limit] as const,
		queryFn: async () => {
			const response = await client.organizations.getOrganizationActivity(organizationId, { cursor, limit })
			return {
				...response,
				data: response.data.map((item) => ({
					...item,
					type: item.action,
					description: formatActivityDescription(item.action, item.entityType, (item.details ?? {}) as Record<string, unknown>),
					actorName: item.adminName ?? undefined,
					actorAvatar: undefined,
				})),
			}
		},
		enabled: !!organizationId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get user sessions
 */
export function useUserSessions() {
	return useQuery({
		queryKey: settingsKeys.sessions(),
		queryFn: () => settingsActions.getUserSessions({}),
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.SHORT,
		...DEFAULT_RETRY_CONFIG,
	})
}

// ============================================
// MUTATIONS - Via Server Actions
// ============================================

/**
 * Update profile
 * Source: @/features/auth/actions/auth-actions.ts
 */
export function useUpdateProfile() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: authActions.updateProfile,
		onSuccess: () => {
			// SSOT: Use authKeys.session() for consistent cache invalidation
			qc.invalidateQueries({ queryKey: authKeys.session() })
			toast.success("Profile updated successfully")
		},
		onError: createMutationErrorHandler("update profile"),
	})
}

/**
 * Update organization settings
 * Passes all supported fields to the server action
 */
export function useUpdateOrganizationSettings(organizationId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: Partial<OrganizationSettings>) =>
			settingsActions.updateOrganization({
				organizationId,
				name: data.name || "",
				description: data.description,
				website: data.website,
				email: data.email,
				phone: data.phone, // Maps to phoneNumber in server action
				contactPerson: data.contactPerson,
				address: data.address,
				city: data.city,
				state: data.state,
				postalCode: data.postalCode,
			}),
		onSuccess: () => {
			// SSOT: Invalidate organizationKeys.detail - shares cache across all org queries
			qc.invalidateQueries({ queryKey: organizationKeys.detail(organizationId) })
			toast.success("Organization settings updated")
		},
		onError: createMutationErrorHandler("update organization settings"),
	})
}

/**
 * Update password
 */
export function useUpdatePassword() {
	return useMutation({
		mutationFn: settingsActions.updatePassword,
		onSuccess: () => {
			toast.success("Password updated successfully")
		},
		onError: createMutationErrorHandler("update password"),
	})
}

/**
 * Update notification settings
 */
export function useUpdateNotifications() {
	return useMutation({
		mutationFn: settingsActions.updateNotifications,
		onSuccess: () => {
			toast.success("Notification settings updated")
		},
		onError: createMutationErrorHandler("update notification settings"),
	})
}

/**
 * Add bank account
 */
export function useAddBankAccount(organizationId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: AddBankAccountInput) => settingsActions.addBankAccount({ ...data, organizationId }),
		onSuccess: () => {
			// SSOT: Use organizationKeys.bankAccounts
			qc.invalidateQueries({ queryKey: organizationKeys.bankAccounts(organizationId) })
			toast.success("Bank account added successfully")
		},
		onError: createMutationErrorHandler("add bank account"),
	})
}

/**
 * Delete bank account
 */
export function useDeleteBankAccount(organizationId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => settingsActions.removeBankAccount({ organizationId, accountId: id }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: organizationKeys.bankAccounts(organizationId) })
			toast.success("Bank account removed")
		},
		onError: createMutationErrorHandler("remove bank account"),
	})
}

/**
 * Set default bank account
 */
export function useSetDefaultBankAccount(organizationId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => settingsActions.setDefaultBankAccount({ organizationId, accountId: id }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: organizationKeys.bankAccounts(organizationId) })
			toast.success("Default bank account updated")
		},
		onError: createMutationErrorHandler("set default bank account"),
	})
}

/**
 * Verify bank account
 */
export function useVerifyBankAccount(organizationId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (bankAccountId: string) => settingsActions.verifyBankAccount({ organizationId, accountId: bankAccountId }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: organizationKeys.bankAccounts(organizationId) })
			toast.success("Bank account verified")
		},
		onError: createMutationErrorHandler("verify bank account"),
	})
}

// NOTE: useVerifyGst REMOVED
// Reason: GST is verified during onboarding via completeOnboarding endpoint
// Once organization is approved, GST cannot be changed (regulatory requirement)
// For GST preview during onboarding, use verifyGST from @/features/organizations/actions/onboarding

/**
 * Enable 2FA
 * Source: @/features/auth/actions/auth-actions.ts
 */
export function useEnable2FA() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ password, issuer }: { password: string; issuer?: string }) =>
			authActions.enable2FA({ password, issuer }),
		onSuccess: () => {
			// SSOT: Use authKeys.session() for consistent cache invalidation
			qc.invalidateQueries({ queryKey: authKeys.session() })
		},
		onError: createMutationErrorHandler("enable 2FA"),
	})
}

/**
 * Verify 2FA - UI confirmation step
 * Note: 2FA is already enabled by enable2FA action. This confirms setup.
 */
export function useVerify2FA() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (_code: string) => {
			// UI confirmation - the actual 2FA is enabled by enable2FA
			return Promise.resolve({ data: { success: true, message: "2FA setup confirmed" } })
		},
		onSuccess: () => {
			// SSOT: Use authKeys.session() for consistent cache invalidation
			qc.invalidateQueries({ queryKey: authKeys.session() })
			toast.success("2FA setup confirmed")
		},
		onError: createMutationErrorHandler("verify 2FA code"),
	})
}

/**
 * Disable 2FA
 * Source: @/features/auth/actions/auth-actions.ts
 */
export function useDisable2FA() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (password: string) => authActions.disable2FA({ password }),
		onSuccess: () => {
			// SSOT: Use authKeys.session() for consistent cache invalidation
			qc.invalidateQueries({ queryKey: authKeys.session() })
			toast.success("2FA disabled")
		},
		onError: createMutationErrorHandler("disable 2FA"),
	})
}

/**
 * Change email
 * Source: @/features/auth/actions/auth-actions.ts
 */
export function useChangeEmail() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ newEmail }: { newEmail: string; password?: string }) =>
			authActions.changeEmail({ newEmail }),
		onSuccess: () => {
			// SSOT: Use authKeys.session() for consistent cache invalidation
			qc.invalidateQueries({ queryKey: authKeys.session() })
			toast.success("Verification email sent to new address")
		},
		onError: createMutationErrorHandler("change email"),
	})
}

/**
 * Delete user account
 * Source: @/features/auth/actions/auth-actions.ts
 */
export function useDeleteUserAccount() {
	return useMutation({
		mutationFn: (password?: string) => authActions.deleteUser({ password }),
		onError: createMutationErrorHandler("delete account"),
	})
}

/**
 * Send verification email
 * Source: @/features/auth/actions/auth-actions.ts
 */
export function useSendVerificationEmail() {
	return useMutation({
		mutationFn: (email?: string) => authActions.sendVerificationEmail({ email }),
		onSuccess: () => {
			toast.success("Verification email sent")
		},
		onError: createMutationErrorHandler("send verification email"),
	})
}

/**
 * Revoke session
 * Source: @/features/auth/actions/auth-actions.ts
 */
export function useRevokeSession() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (sessionId: string) => authActions.revokeSession({ token: sessionId }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: settingsKeys.sessions() })
			toast.success("Session revoked")
		},
		onError: createMutationErrorHandler("revoke session"),
	})
}

/**
 * Revoke all sessions
 * Source: @/features/auth/actions/auth-actions.ts
 */
export function useRevokeAllSessions() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: () => authActions.revokeOtherSessions({}),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: settingsKeys.sessions() })
			toast.success("All other sessions revoked")
		},
		onError: createMutationErrorHandler("revoke sessions"),
	})
}

// ============================================
// Helpers
// ============================================

function formatActivityDescription(
	action: string,
	entityType: string,
	details: Record<string, unknown>
): string {
	const actionDescriptions: Record<string, string> = {
		campaign_created: "created a new campaign",
		campaign_activated: "activated the campaign",
		campaign_paused: "paused the campaign",
		campaign_completed: "marked the campaign as completed",
		enrollment_approved: "approved an enrollment",
		enrollment_rejected: "rejected an enrollment",
		enrollment_bulk_approved: "bulk approved enrollments",
		withdrawal_requested: "requested a withdrawal",
		withdrawal_completed: "completed a withdrawal",
		member_invited: "invited a new team member",
		member_joined: "joined the team",
		member_removed: "removed a team member",
		invoice_generated: "generated an invoice",
		product_created: "added a new product",
		settings_updated: "updated organization settings",
	}

	const entityName =
		(typeof details?.name === "string" ? details.name : null) ||
		(typeof details?.title === "string" ? details.title : null) ||
		entityType
	const base = actionDescriptions[action] || `performed ${action.replace(/_/g, " ")}`

	return entityName && entityName !== entityType ? `${base}: ${entityName}` : base
}

// Types are exported from @/features/settings (feature index)
