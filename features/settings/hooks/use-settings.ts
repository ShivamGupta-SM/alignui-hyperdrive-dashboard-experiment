/**
 * Settings React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import { STALE_TIME } from "@/lib/utils/query-config"
import * as actions from "../actions/settings"
import type { OrganizationSettings, AddBankAccountInput, VerifyGstInput } from "../types"

// ============================================
// Client Instance
// ============================================
const client = getEncoreBrowserClient()

// ============================================
// Query Keys
// ============================================
export const settingsKeys = {
	all: (orgId: string) => ["settings", orgId] as const,
	organization: (orgId: string) => [...settingsKeys.all(orgId), "organization"] as const,
	bankAccounts: (orgId: string) => [...settingsKeys.all(orgId), "bankAccounts"] as const,
	gst: (orgId: string) => [...settingsKeys.all(orgId), "gst"] as const,
	activity: (orgId: string) => [...settingsKeys.all(orgId), "activity"] as const,
	sessions: () => ["sessions"] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * Get organization settings
 */
export function useOrganizationSettings(organizationId: string) {
	return useQuery({
		queryKey: settingsKeys.organization(organizationId),
		queryFn: async () => {
			if (organizationId && organizationId !== "me") {
				return client.organizations.getOrganization(organizationId)
			}
			const me = await client.auth.me()
			const activeOrgId = me.activeOrganizationId
			if (!activeOrgId) throw new Error("No active organization")
			return client.organizations.getOrganization(activeOrgId)
		},
		enabled: !!organizationId,
		staleTime: STALE_TIME.MEDIUM,
	})
}

/**
 * Get bank accounts
 */
export function useBankAccounts(organizationId: string) {
	return useQuery({
		queryKey: settingsKeys.bankAccounts(organizationId),
		queryFn: () => client.organizations.listBankAccounts(organizationId),
		enabled: !!organizationId,
		staleTime: STALE_TIME.MEDIUM,
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
	})
}

/**
 * Get all settings data (for SSR hydration)
 */
export function useSettingsData(organizationId: string) {
	return useQuery({
		queryKey: settingsKeys.all(organizationId),
		queryFn: async () => {
			let activeOrgId = organizationId
			if (organizationId === "me" || !organizationId) {
				const me = await client.auth.me()
				if (!me.activeOrganizationId) throw new Error("No active organization")
				activeOrgId = me.activeOrganizationId
			}

			const [organization, bankAccountsData, gstData] = await Promise.all([
				client.organizations.getOrganization(activeOrgId),
				client.organizations.listBankAccounts(activeOrgId),
				client.organizations.getGSTDetails(activeOrgId),
			])

			return {
				organization,
				bankAccounts: bankAccountsData.data || [],
				gstDetails: gstData.gstDetails,
			}
		},
		enabled: !!organizationId,
		staleTime: STALE_TIME.MEDIUM,
	})
}

/**
 * Get organization activity
 */
export function useOrganizationActivity(organizationId: string, skip = 0, take = 20) {
	return useQuery({
		queryKey: [...settingsKeys.activity(organizationId), { skip, take }],
		queryFn: async () => {
			const response = await client.organizations.getOrganizationActivity(organizationId, { skip, take })
			return {
				...response,
				data: (
					response.data as Array<{
						id: string
						action: string
						entityType: string
						entityId: string
						details: Record<string, unknown>
						adminName: string | null
						createdAt: string
					}>
				).map((item) => ({
					...item,
					type: item.action,
					description: formatActivityDescription(item.action, item.entityType, item.details),
					actorName: item.adminName ?? undefined,
					actorAvatar: undefined,
				})),
			}
		},
		enabled: !!organizationId,
		staleTime: STALE_TIME.SHORT,
	})
}

/**
 * Get user sessions
 */
export function useUserSessions() {
	return useQuery({
		queryKey: settingsKeys.sessions(),
		queryFn: () => actions.getUserSessions({}),
	})
}

// ============================================
// MUTATIONS - Via Server Actions
// ============================================

/**
 * Update profile
 */
export function useUpdateProfile() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: actions.updateProfile,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["auth"] })
		},
	})
}

/**
 * Update organization settings
 */
export function useUpdateOrganizationSettings(organizationId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: Partial<OrganizationSettings>) => actions.updateOrganization({ organizationId, name: data.name || "", website: data.website, address: data.address }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: settingsKeys.organization(organizationId) })
		},
	})
}

/**
 * Update password
 */
export function useUpdatePassword() {
	return useMutation({
		mutationFn: actions.updatePassword,
	})
}

/**
 * Update notification settings
 */
export function useUpdateNotifications() {
	return useMutation({
		mutationFn: actions.updateNotifications,
	})
}

/**
 * Add bank account
 */
export function useAddBankAccount(organizationId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: AddBankAccountInput) => actions.addBankAccount({ ...data, organizationId }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: settingsKeys.bankAccounts(organizationId) })
		},
	})
}

/**
 * Delete bank account
 */
export function useDeleteBankAccount(organizationId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.removeBankAccount({ organizationId, accountId: id }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: settingsKeys.bankAccounts(organizationId) })
		},
	})
}

/**
 * Set default bank account
 */
export function useSetDefaultBankAccount(organizationId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => actions.setDefaultBankAccount({ organizationId, accountId: id }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: settingsKeys.bankAccounts(organizationId) })
		},
	})
}

/**
 * Verify bank account
 */
export function useVerifyBankAccount(organizationId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (bankAccountId: string) => actions.verifyBankAccount({ organizationId, accountId: bankAccountId }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: settingsKeys.bankAccounts(organizationId) })
		},
	})
}

/**
 * Verify GST
 */
export function useVerifyGst(organizationId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: VerifyGstInput) => client.organizations.verifyGST(organizationId, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: settingsKeys.gst(organizationId) })
			qc.invalidateQueries({ queryKey: settingsKeys.organization(organizationId) })
		},
	})
}

/**
 * Enable 2FA
 */
export function useEnable2FA() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ password, issuer }: { password: string; issuer?: string }) =>
			actions.enable2FA({ password, issuer }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["auth"] })
		},
	})
}

/**
 * Verify 2FA
 */
export function useVerify2FA() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (code: string) => actions.verify2FA({ code }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["auth"] })
		},
	})
}

/**
 * Disable 2FA
 */
export function useDisable2FA() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (password: string) => actions.disable2FA({ password }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["auth"] })
		},
	})
}

/**
 * Change email
 */
export function useChangeEmail() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ newEmail, password }: { newEmail: string; password: string }) =>
			actions.changeEmail({ newEmail, password }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["auth"] })
		},
	})
}

/**
 * Delete user account
 */
export function useDeleteUserAccount() {
	return useMutation({
		mutationFn: (password?: string) => actions.deleteUserAccount({ password }),
	})
}

/**
 * Send verification email
 */
export function useSendVerificationEmail() {
	return useMutation({
		mutationFn: (email?: string) => actions.sendVerificationEmail({ email }),
	})
}

/**
 * Revoke session
 */
export function useRevokeSession() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (sessionId: string) => actions.revokeSession({ sessionId }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: settingsKeys.sessions() })
		},
	})
}

/**
 * Revoke all sessions
 */
export function useRevokeAllSessions() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: () => actions.revokeAllSessions({}),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: settingsKeys.sessions() })
		},
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

	const entityName = (details?.name as string) || (details?.title as string) || entityType
	const base = actionDescriptions[action] || `performed ${action.replace(/_/g, " ")}`

	return entityName && entityName !== entityType ? `${base}: ${entityName}` : base
}

// Re-export types
export type * from "../types"
