'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { organizations } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'

// ============================================
// Query Keys
// ============================================

export const settingsKeys = {
  all: ['settings'] as const,
  organization: () => [...settingsKeys.all, 'organization'] as const,
  bankAccounts: () => [...settingsKeys.all, 'bankAccounts'] as const,
  gst: () => [...settingsKeys.all, 'gst'] as const,
  data: () => [...settingsKeys.all, 'data'] as const,
  activity: (orgId: string) => [...settingsKeys.all, 'activity', orgId] as const,
}

// Re-export types from Encore for convenience
export type OrganizationBankAccount = organizations.OrganizationBankAccount
export type GSTDetails = organizations.GSTDetails
export type PANDetails = organizations.PANDetails
// Note: Organization is exported from use-organizations.ts

// ============================================
// Types
// ============================================

export interface OrganizationSettings {
  name: string
  slug: string
  website?: string
  logo?: string
  description?: string
  phoneNumber?: string
  address?: string
  industryCategory?: string
  contactPerson?: string
  city?: string
  state?: string
  postalCode?: string
}

export interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountHolderName: string
  ifscCode: string
  isDefault: boolean
  isVerified: boolean
  accountType: 'current' | 'savings'
}

export interface GstDetails {
  gstNumber: string
  legalName?: string
  tradeName?: string
  state?: string
  isVerified: boolean
}

export interface SettingsData {
  organization: organizations.Organization
  bankAccounts: OrganizationBankAccount[]
  gstDetails: GSTDetails | null
  panDetails: PANDetails | null
}

// ============================================
// Query Hooks
// ============================================

export function useOrganizationSettings(organizationId: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: settingsKeys.organization(),
    queryFn: () => client.organizations.getOrganization(organizationId),
    enabled: !!organizationId,
    staleTime: STALE_TIMES.STATIC,
  })
}

export function useBankAccounts(organizationId: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: settingsKeys.bankAccounts(),
    queryFn: () => client.organizations.listBankAccounts(organizationId),
    enabled: !!organizationId,
    staleTime: STALE_TIMES.STATIC,
  })
}

export function useGstDetails(organizationId: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: settingsKeys.gst(),
    queryFn: () => client.organizations.getGSTDetails(organizationId),
    enabled: !!organizationId,
    staleTime: STALE_TIMES.STATIC,
  })
}

// ============================================
// Mutation Hooks
// ============================================

export function useUpdateOrganizationSettings(organizationId: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: Partial<OrganizationSettings>) =>
      client.organizations.updateOrganization(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.organization() })
    },
  })
}

// ============================================
// SSR Hydration Hook
// ============================================

/**
 * Fetch settings data for SSR hydration
 * Used by the settings page to hydrate React Query cache
 */
export function useSettingsData(organizationId: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: settingsKeys.data(),
    queryFn: async () => {
      const [organization, bankAccountsData, gstData, panData] = await Promise.all([
        client.organizations.getOrganization(organizationId),
        client.organizations.listBankAccounts(organizationId),
        client.organizations.getGSTDetails(organizationId),
        client.organizations.getPANDetails(organizationId),
      ])
      return {
        organization,
        bankAccounts: bankAccountsData.data,
        gstDetails: gstData.gstDetails,
        panDetails: panData.panDetails,
      }
    },
    enabled: !!organizationId,
    staleTime: STALE_TIMES.STATIC,
  })
}

// ============================================
// Organization Activity Hooks
// ============================================

export type OrganizationActivityType =
  | 'campaign_created'
  | 'campaign_activated'
  | 'campaign_paused'
  | 'campaign_completed'
  | 'enrollment_approved'
  | 'enrollment_rejected'
  | 'enrollment_bulk_approved'
  | 'withdrawal_requested'
  | 'withdrawal_completed'
  | 'member_invited'
  | 'member_joined'
  | 'member_removed'
  | 'invoice_generated'
  | 'product_created'
  | 'settings_updated'

export interface OrganizationActivity {
  id: string
  action: string
  type: OrganizationActivityType // Alias for action for component compatibility
  entityType: string
  entityId: string
  details: Record<string, unknown>
  description?: string
  actorName?: string
  actorAvatar?: string
  adminName: string | null
  createdAt: string
}

export interface OrganizationActivityResponse {
  data: OrganizationActivity[]
  total: number
  skip: number
  take: number
  hasMore: boolean
}

// Helper to format activity description from action and entity type
function formatActivityDescription(action: string, entityType: string, details: Record<string, unknown>): string {
  const actionDescriptions: Record<string, string> = {
    campaign_created: 'created a new campaign',
    campaign_activated: 'activated the campaign',
    campaign_paused: 'paused the campaign',
    campaign_completed: 'marked the campaign as completed',
    enrollment_approved: 'approved an enrollment',
    enrollment_rejected: 'rejected an enrollment',
    enrollment_bulk_approved: 'bulk approved enrollments',
    withdrawal_requested: 'requested a withdrawal',
    withdrawal_completed: 'completed a withdrawal',
    member_invited: 'invited a new team member',
    member_joined: 'joined the team',
    member_removed: 'removed a team member',
    invoice_generated: 'generated an invoice',
    product_created: 'added a new product',
    settings_updated: 'updated organization settings',
  }

  const entityName = (details?.name as string) || (details?.title as string) || entityType
  const base = actionDescriptions[action] || `performed ${action.replace(/_/g, ' ')}`

  return entityName && entityName !== entityType ? `${base}: ${entityName}` : base
}

/**
 * Fetch organization activity feed
 * Shows audit trail of actions taken in the organization
 */
export function useOrganizationActivity(organizationId: string, skip = 0, take = 20) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: [...settingsKeys.activity(organizationId), { skip, take }] as const,
    queryFn: async (): Promise<OrganizationActivityResponse> => {
      const response = await client.organizations.getOrganizationActivity(organizationId, { skip, take })
      // Map action to type for component compatibility
      return {
        ...response,
        data: response.data.map((item) => ({
          ...item,
          type: item.action as OrganizationActivityType,
          description: formatActivityDescription(item.action, item.entityType, item.details),
          actorName: item.adminName ?? undefined,
          actorAvatar: undefined,
        })),
      }
    },
    enabled: !!organizationId,
    staleTime: STALE_TIMES.STANDARD,
  })
}

// ============================================
// Bank Account Mutation Hooks
// ============================================

export interface AddBankAccountInput {
  bankName: string
  accountNumber: string
  accountHolderName: string
  ifscCode: string
  accountType: 'current' | 'savings'
}

/**
 * Add a new bank account
 */
export function useAddBankAccount(organizationId: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: AddBankAccountInput) =>
      client.organizations.addBankAccount(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.bankAccounts() })
    },
  })
}

/**
 * Delete a bank account
 */
export function useDeleteBankAccount(organizationId: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (id: string) =>
      client.organizations.deleteBankAccount(organizationId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.bankAccounts() })
    },
  })
}

/**
 * Set bank account as default
 */
export function useSetDefaultBankAccount(organizationId: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (id: string) =>
      client.organizations.setDefaultBankAccount(organizationId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.bankAccounts() })
    },
  })
}

// ============================================
// Verification Hooks
// ============================================

export interface VerifyGstInput {
  gstNumber: string
}

/**
 * Verify GST number
 */
export function useVerifyGst(organizationId: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: VerifyGstInput) =>
      client.organizations.verifyGST(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.gst() })
      queryClient.invalidateQueries({ queryKey: settingsKeys.organization() })
    },
  })
}

export interface VerifyPanInput {
  panNumber: string
}

/**
 * Verify PAN number
 */
export function useVerifyPan(organizationId: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: VerifyPanInput) =>
      client.organizations.verifyPAN(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.organization() })
    },
  })
}

/**
 * Verify bank account (penny drop verification)
 */
export function useVerifyBankAccount(organizationId: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (bankAccountId: string) =>
      client.organizations.verifyBankAccount(organizationId, bankAccountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.bankAccounts() })
    },
  })
}
