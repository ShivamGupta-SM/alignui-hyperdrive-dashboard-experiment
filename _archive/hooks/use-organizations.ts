'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, patch } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { Organization, ApiResponse, ApiError } from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'

// ============================================
// Query Keys
// ============================================

export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  myOrgs: () => [...organizationKeys.all, 'my'] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  current: () => [...organizationKeys.all, 'current'] as const,
}

// Retry configuration - don't retry on 4xx errors
const shouldRetry = (failureCount: number, error: AxiosError<ApiError>) => {
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false
  }
  return failureCount < 3
}

// ============================================
// Types
// ============================================

export interface OrganizationSummary {
  id: string
  name: string
  logo: string | null
  role: 'owner' | 'admin' | 'member'
  isActive: boolean
  createdAt: string
}

export interface CreditIncreaseRequest {
  amount: number
  reason: string
  businessJustification?: string
}

// ============================================
// Query Hooks
// ============================================

/**
 * Get all organizations the current user belongs to
 */
export function useMyOrganizations() {
  return useQuery({
    queryKey: organizationKeys.myOrgs(),
    queryFn: () => get<ApiResponse<OrganizationSummary[]>>('/api/organizations/my'),
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

/**
 * Get current active organization
 */
export function useCurrentOrganization() {
  return useQuery({
    queryKey: organizationKeys.current(),
    queryFn: () => get<ApiResponse<Organization>>('/api/organizations/current'),
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

/**
 * Get organization by ID
 */
export function useOrganization(id: string) {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => get<ApiResponse<Organization>>(`/api/organizations/${id}`),
    enabled: !!id,
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
// Mutation Hooks
// ============================================

/**
 * Switch to a different organization
 */
export function useSwitchOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (organizationId: string) =>
      post<ApiResponse<{ organizationId: string; message: string }>>('/api/organizations/switch', { organizationId }),
    onSuccess: () => {
      // Invalidate all queries since org context changed
      queryClient.invalidateQueries()
    },
  })
}

/**
 * Update organization logo
 */
export function useUpdateOrganizationLogo(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { logoUrl: string } | FormData) =>
      patch<ApiResponse<{ id: string; logo: string }>>(`/api/organizations/${id}/logo`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: organizationKeys.myOrgs() })
      queryClient.invalidateQueries({ queryKey: organizationKeys.current() })
    },
  })
}

/**
 * Request credit limit increase
 */
export function useRequestCreditIncrease(id: string) {
  return useMutation({
    mutationFn: (data: CreditIncreaseRequest) =>
      post<ApiResponse<{ requestId: string; status: string; message: string }>>(`/api/organizations/${id}/credit-increase`, data),
  })
}

/**
 * Update organization details (name, website, etc.)
 * Note: This is different from useUpdateOrganization in use-settings which updates organization settings
 */
export function useUpdateOrganizationDetails(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Organization>) =>
      patch<ApiResponse<Organization>>(`/api/organizations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: organizationKeys.current() })
    },
  })
}
