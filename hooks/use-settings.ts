'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, patch, del } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiResponse, ApiError } from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'

// Retry configuration - don't retry on 4xx errors
const shouldRetry = (failureCount: number, error: AxiosError<ApiError>) => {
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false
  }
  return failureCount < 3
}

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

// ============================================
// Types
// ============================================

export interface OrganizationSettings {
  name: string
  slug: string
  website: string
  logo: string
  email: string
  phone: string
  address: string
  industry: string
}

export interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountHolder: string
  ifscCode: string
  isDefault: boolean
  isVerified: boolean
}

export interface GstDetails {
  gstNumber: string
  legalName: string
  tradeName: string
  state: string
  isVerified: boolean
}

export interface SettingsData {
  user: {
    name: string
    email: string
    phone: string
    avatar?: string
    role: string
  }
  organization: OrganizationSettings
  bankAccounts: BankAccount[]
  gstDetails: GstDetails
}

// ============================================
// Query Hooks
// ============================================

export function useOrganizationSettings() {
  return useQuery({
    queryKey: settingsKeys.organization(),
    queryFn: () => get<ApiResponse<OrganizationSettings>>('/api/settings/organization'),
    staleTime: STALE_TIMES.STATIC,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

export function useBankAccounts() {
  return useQuery({
    queryKey: settingsKeys.bankAccounts(),
    queryFn: () => get<ApiResponse<BankAccount[]>>('/api/settings/bank-accounts'),
    staleTime: STALE_TIMES.STATIC,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

export function useGstDetails() {
  return useQuery({
    queryKey: settingsKeys.gst(),
    queryFn: () => get<ApiResponse<GstDetails>>('/api/settings/gst'),
    staleTime: STALE_TIMES.STATIC,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

// ============================================
// Mutation Hooks
// ============================================

export function useUpdateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<OrganizationSettings>) =>
      patch<ApiResponse<OrganizationSettings>>('/api/settings/organization', data),
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
export function useSettingsData() {
  return useQuery({
    queryKey: settingsKeys.data(),
    queryFn: async () => {
      const response = await get<ApiResponse<SettingsData>>('/api/settings/data')
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
    staleTime: STALE_TIMES.STATIC,
    retry: shouldRetry,
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
  type: OrganizationActivityType
  title: string
  description: string
  actorId: string
  actorName: string
  actorAvatar: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface OrganizationActivityResponse {
  data: OrganizationActivity[]
  total: number
  skip: number
  take: number
  hasMore: boolean
}

/**
 * Fetch organization activity feed
 * Shows audit trail of actions taken in the organization
 */
export function useOrganizationActivity(organizationId: string, skip = 0, take = 20) {
  return useQuery({
    queryKey: [...settingsKeys.activity(organizationId), { skip, take }] as const,
    queryFn: () => get<ApiResponse<OrganizationActivityResponse>>(`/api/organizations/${organizationId}/activity`, {
      params: { skip, take }
    }),
    enabled: !!organizationId,
    staleTime: STALE_TIMES.STANDARD,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

// ============================================
// Bank Account Mutation Hooks
// ============================================

export interface AddBankAccountInput {
  bankName: string
  accountNumber: string
  confirmAccountNumber: string
  accountHolder: string
  ifscCode: string
}

export interface BankAccountResponse extends BankAccount {
  verificationStatus?: 'pending' | 'verified' | 'failed'
  addedAt?: string
}

/**
 * Add a new bank account
 */
export function useAddBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddBankAccountInput) =>
      post<ApiResponse<BankAccountResponse>>('/api/settings/bank-accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.bankAccounts() })
    },
  })
}

/**
 * Delete a bank account
 */
export function useDeleteBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      del<ApiResponse<{ message: string; id: string }>>(`/api/settings/bank-accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.bankAccounts() })
    },
  })
}

/**
 * Set bank account as default
 */
export function useSetDefaultBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      patch<ApiResponse<BankAccount>>(`/api/settings/bank-accounts/${id}`, { isDefault: true }),
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

export interface GstVerificationResponse {
  gstNumber: string
  legalName: string
  tradeName: string
  state: string
  status: 'active' | 'inactive' | 'cancelled'
  isVerified: boolean
  registrationDate: string
  businessType: string
}

/**
 * Verify GST number
 */
export function useVerifyGst() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: VerifyGstInput) =>
      post<ApiResponse<GstVerificationResponse>>('/api/settings/gst/verify', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.gst() })
    },
  })
}

export interface VerifyPanInput {
  panNumber: string
  name: string
}

export interface PanVerificationResponse {
  panNumber: string
  name: string
  nameMatch: boolean
  isValid: boolean
  panType: 'individual' | 'company' | 'trust' | 'other'
}

/**
 * Verify PAN number
 */
export function useVerifyPan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: VerifyPanInput) =>
      post<ApiResponse<PanVerificationResponse>>('/api/settings/pan/verify', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.organization() })
    },
  })
}

export interface VerifyBankAccountInput {
  bankAccountId: string
}

export interface BankAccountVerificationResponse {
  id: string
  accountNumber: string
  accountHolder: string
  bankName: string
  ifscCode: string
  isVerified: boolean
  verificationStatus: 'pending' | 'verified' | 'failed'
  verificationMessage?: string
}

/**
 * Verify bank account (penny drop verification)
 */
export function useVerifyBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: VerifyBankAccountInput) =>
      post<ApiResponse<BankAccountVerificationResponse>>('/api/settings/bank-accounts/verify', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.bankAccounts() })
    },
  })
}

// ============================================
// Update GST Details
// ============================================

export interface UpdateGstInput {
  gstNumber: string
  legalName?: string
  tradeName?: string
  state?: string
}

/**
 * Update/Save GST details
 */
export function useUpdateGstDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateGstInput) =>
      post<ApiResponse<GstDetails>>('/api/settings/gst', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.gst() })
    },
  })
}
